import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { CATEGORIES_PAR_DEFAUT } from '../data/categories';

export function useCategories(type) {
  const personnalisees = useLiveQuery(
    () => db.categories.where('type').equals(type).filter((c) => !c.deleted).toArray(),
    [type] // la requête se relance si `type` change (ex: passer de 'depense' à 'produit')
  );

  const parDefaut = CATEGORIES_PAR_DEFAUT[type] || [];
  const categories = [...parDefaut, ...(personnalisees || [])];

  async function ajouterCategorie(nom, icone) {
    const maintenant = new Date().toISOString();
    await db.categories.add({
      id: crypto.randomUUID(),
      type, nom, icone,
      updatedAt: maintenant, deleted: false,
    });
  }

  return { categories, ajouterCategorie };
}