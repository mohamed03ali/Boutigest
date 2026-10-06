import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useClients() {
  const clients = useLiveQuery(
    () => db.clients.orderBy('nom').filter((c) => !c.deleted).toArray(),
    []
  );

  async function ajouterClient(donnees) {
    await db.clients.add({
      ...donnees,
      id: crypto.randomUUID(),
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