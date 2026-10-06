import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

function debutPeriode(periode) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (periode === 'jour') return d;
  if (periode === 'semaine') {
    const jourSemaine = d.getDay();
    const decalage = jourSemaine === 0 ? 6 : jourSemaine - 1;
    d.setDate(d.getDate() - decalage);
    return d;
  }
  if (periode === 'mois') {
    d.setDate(1);
    return d;
  }
  return new Date(0);
}

export function useRapports() {
  const [periode, setPeriode] = useState('mois');

  const donnees = useLiveQuery(async () => {
    const debut = debutPeriode(periode);

    const ventes = await db.ventes.where('date').aboveOrEqual(debut.toISOString()).reverse().sortBy('date');
    const venteLignes = await db.venteLignes.toArray();
    const produits = await db.produits.toArray();
    const clients = await db.clients.toArray();
    const depenses = await db.depenses.where('date').aboveOrEqual(debut.toISOString()).reverse().sortBy('date');

    const idsVentesPeriode = new Set(ventes.map((v) => v.id));
    const lignesPeriode = venteLignes.filter((l) => idsVentesPeriode.has(l.venteId));

    let beneficeBrut = 0;
    const parCategorie = {};
    for (const ligne of lignesPeriode) {
      const produit = produits.find((p) => p.id === ligne.produitId);
      if (!produit) continue;
      beneficeBrut += (ligne.prixUnitaire - produit.prixAchat) * ligne.quantite;
      const cat = produit.categorie || 'Autre';
      parCategorie[cat] = (parCategorie[cat] || 0) + ligne.prixUnitaire * ligne.quantite;
    }

    const ventesPeriode = ventes.map((v) => ({
      ...v,
      nomClient: clients.find((c) => c.id === v.clientId)?.nom || null,
      nombreArticles: venteLignes.filter((l) => l.venteId === v.id).reduce((sum, l) => sum + l.quantite, 0),
    }));

    const totalVentes = ventes.reduce((sum, v) => sum + v.total, 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    const beneficeNet = beneficeBrut - totalDepenses;

    const totalCategories = Object.values(parCategorie).reduce((a, b) => a + b, 0) || 1;
    const repartitionParCategorie = Object.entries(parCategorie).map(([nom, valeur]) => ({
      nom, valeur, pourcentage: Math.round((valeur / totalCategories) * 100),
    }));

    return {
      totalVentes, totalDepenses, beneficeBrut, beneficeNet, repartitionParCategorie,
      ventesPeriode, depensesPeriode: depenses,
    };
  }, [periode]);

  return {
    ...(donnees || {
      totalVentes: 0, totalDepenses: 0, beneficeBrut: 0, beneficeNet: 0,
      repartitionParCategorie: [], ventesPeriode: [], depensesPeriode: [],
    }),
    recalculer: setPeriode, // Rapports.jsx appelle déjà recalculer(p) — ça devient juste un setPeriode
  };
}