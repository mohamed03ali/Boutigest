import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useDepenses() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const depenses = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const liste = await db.depenses.where('boutiqueId').equals(boutiqueId).and((d) => !d.deleted).toArray();
    return liste.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [boutiqueId]);

  async function ajouterDepense(donnees) {
    if (!boutiqueId) return;
    const maintenant = new Date().toISOString();
    await db.depenses.add({
      ...donnees,
      id: crypto.randomUUID(),
      boutiqueId,
      date: maintenant,
      updatedAt: maintenant,
      deleted: false,
    });
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