import { db } from '../db/db';
import { getDerniereSync, setDerniereSync } from './syncMeta';
import { getSyncToken } from './syncAuth';

const API_URL = 'http://localhost:3000';

const TABLES = [
  'produits', 'clients', 'ventes', 'venteLignes', 'mouvementsStock',
  'dettes', 'depenses', 'categories', 'zakats', 'notifications',
];

async function collecterChangementsLocaux(depuis) {
  const changements = {};
  for (const table of TABLES) {
    const lignes = await db[table]
      .filter((ligne) => ligne.updatedAt > depuis)
      .toArray();
    changements[table] = lignes;
  }
  return changements;
}

async function envoyerPush(changements, token) {
  const reponse = await fetch(`${API_URL}/sync/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ changements }),
  });
  if (!reponse.ok) throw new Error('Échec du push');
  return reponse.json();
}

async function recupererPull(depuis, token) {
  const reponse = await fetch(`${API_URL}/sync/pull?depuis=${encodeURIComponent(depuis)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!reponse.ok) throw new Error('Échec du pull');
  return reponse.json();
}

async function appliquerChangementsServeur(changements) {
  for (const table of TABLES) {
    const lignes = changements[table] || [];
    for (const ligneServeur of lignes) {
      const ligneLocale = await db[table].get(ligneServeur.id);

      if (!ligneLocale) {
        await db[table].add(ligneServeur);
      } else if (ligneServeur.updatedAt > ligneLocale.updatedAt) {
        await db[table].put(ligneServeur);
      }
    }
  }
}
// src/services/syncEngine.js — remplace la fonction synchroniser()
export async function synchroniser() {
  const token = getSyncToken();
  if (!token) return { succes: false, erreur: 'Aucun jeton de synchronisation.' };
  if (!navigator.onLine) return { succes: false, erreur: 'Hors ligne.' };

  try {
    const derniereSync = getDerniereSync();

    const changementsLocaux = await collecterChangementsLocaux(derniereSync);
    const aDesChangements = Object.values(changementsLocaux).some((lignes) => lignes.length > 0);

    let resultatPush = null;
    if (aDesChangements) {
      resultatPush = await envoyerPush(changementsLocaux, token);
    }

    const { changements } = await recupererPull(derniereSync, token);
    await appliquerChangementsServeur(changements);

    // On n'avance le curseur QUE si le push n'a signalé aucune vraie erreur
    const aEuDesErreurs = resultatPush &&
      Object.values(resultatPush.resultats).some((r) => r.erreurs > 0);

    if (!aEuDesErreurs) {
      setDerniereSync(new Date().toISOString());
    }

    return { succes: true, erreursPartielles: aEuDesErreurs };
  } catch (err) {
    console.error('Erreur de synchronisation:', err);
    return { succes: false, erreur: err.message };
  }
}