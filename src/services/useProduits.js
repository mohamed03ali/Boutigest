import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useProduits() {
  const produits = useLiveQuery(
    () => db.produits.orderBy('nom').filter((p) => !p.deleted).toArray(),
    []
  );

  async function ajouterProduit(donnees) {
    await db.produits.add({ ...donnees, id: crypto.randomUUID(), updatedAt: new Date().toISOString(), deleted: false });
  }

  async function modifierProduit(id, donnees) {
    await db.produits.update(id, { ...donnees, updatedAt: new Date().toISOString() });
  }

  async function supprimerProduit(id) {
    await db.produits.update(id, { deleted: true, updatedAt: new Date().toISOString() });
  }

  return { produits: produits || [], chargement: produits === undefined, ajouterProduit, modifierProduit, supprimerProduit };
}