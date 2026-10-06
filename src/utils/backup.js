import { db } from '../db/db';

const TABLES = [
  'produits', 'ventes', 'venteLignes', 'mouvementsStock',
  'clients', 'dettes', 'depenses', 'utilisateurs', 'boutiques',
  'categories', 'zakats', 'notifications',
];

export async function exporterSauvegarde() {
  const donnees = {};
  for (const table of TABLES) {
    donnees[table] = await db[table].toArray();
  }
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boutigest-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restaurerSauvegarde(fichier) {
  const texte = await fichier.text();
  const donnees = JSON.parse(texte);

  await db.transaction('rw', TABLES.map((t) => db[t]), async () => {
    for (const table of TABLES) {
      if (donnees[table]) {
        await db[table].clear();
        await db[table].bulkAdd(donnees[table]);
      }
    }
  });
}