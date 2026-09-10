import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useDepenses() {
  const [depenses, setDepenses] = useState([]);

  const recharger = useCallback(async () => {
    const toutes = await db.depenses.orderBy('date').reverse().toArray();
    setDepenses(toutes);
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function ajouterDepense(donnees) {
    await db.depenses.add({ ...donnees, date: new Date().toISOString() });
    await recharger();
  }

  async function supprimerDepense(id) {
    await db.depenses.delete(id);
    await recharger();
  }

  const totalMois = depenses
    .filter((d) => {
      const date = new Date(d.date);
      const maintenant = new Date();
      return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear();
    })
    .reduce((sum, d) => sum + d.montant, 0);

  return { depenses, ajouterDepense, supprimerDepense, totalMois };
}
