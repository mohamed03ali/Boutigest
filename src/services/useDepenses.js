import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useDepenses() {
  const depenses = useLiveQuery(
    () => db.depenses.orderBy('date').reverse().filter((d) => !d.deleted).toArray(),
    []
  );

  async function ajouterDepense(donnees) {
    const maintenant = new Date().toISOString();
    await db.depenses.add({ ...donnees, id: crypto.randomUUID(), date: maintenant, updatedAt: maintenant, deleted: false });
  }

  async function supprimerDepense(id) {
    await db.depenses.update(id, { deleted: true, updatedAt: new Date().toISOString() });
  }

  const liste = depenses || [];
  const totalMois = liste
    .filter((d) => {
      const date = new Date(d.date);
      const maintenant = new Date();
      return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear();
    })
    .reduce((sum, d) => sum + d.montant, 0);

  return { depenses: liste, ajouterDepense, supprimerDepense, totalMois };
}