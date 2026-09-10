/*import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { CATEGORIES_PAR_DEFAUT } from '../data/categories';

export function useCategories(type) {
  const [categories, setCategories] = useState([]);

  const recharger = useCallback(async () => {
    const personnalisees = await db.categories.where('type').equals(type).toArray();
    const parDefaut = CATEGORIES_PAR_DEFAUT[type] || [];
    setCategories([...parDefaut, ...personnalisees]);
  }, [type]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function ajouterCategorie(nom, icone) {
    await db.categories.add({ type, nom, icone });
    await recharger();
  }

  return { categories, ajouterCategorie };
}

*/