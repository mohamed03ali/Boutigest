import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useProduits() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const produits = useLiveQuery(() => {
    if (!boutiqueId) return [];
    return db.produits
      .where('boutiqueId').equals(boutiqueId)
      .and((p) => !p.deleted)
      .sortBy('nom');
  }, [boutiqueId]);

  async function ajouterProduit(donnees) {
    if (!boutiqueId) return;
    await db.produits.add({
      ...donnees,
      id: crypto.randomUUID(),
      boutiqueId,
      updatedAt: new Date().toISOString(),
      deleted: false,
    });
  }

  async function modifierProduit(id, donnees) {
    await db.produits.update(id, { ...donnees, updatedAt: new Date().toISOString() });
  }

  async function supprimerProduit(id) {
    await db.produits.update(id, { deleted: true, updatedAt: new Date().toISOString() });
  }

  return { produits: produits || [], chargement: produits === undefined, ajouterProduit, modifierProduit, supprimerProduit };
}