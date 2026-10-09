import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useClients() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const clients = useLiveQuery(() => {
    if (!boutiqueId) return [];
    return db.clients
      .where('boutiqueId').equals(boutiqueId)
      .and((c) => !c.deleted)
      .sortBy('nom');
  }, [boutiqueId]);

  async function ajouterClient(donnees) {
    if (!boutiqueId) return;
    await db.clients.add({
      ...donnees,
      id: crypto.randomUUID(),
      boutiqueId,
      solde: 0,
      updatedAt: new Date().toISOString(),
      deleted: false,
    });
  }

  async function modifierClient(id, donnees) {
    await db.clients.update(id, { ...donnees, updatedAt: new Date().toISOString() });
  }

  return { clients: clients || [], ajouterClient, modifierClient };
}