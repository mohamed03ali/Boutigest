import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useDettes() {
  const dettes = useLiveQuery(async () => {
    const toutes = await db.dettes.orderBy('date').reverse().filter((d) => !d.deleted).toArray();
    const clients = await db.clients.filter((c) => !c.deleted).toArray();
    return toutes.map((d) => ({
      ...d,
      nomClient: clients.find((c) => c.id === d.clientId)?.nom || 'Client supprimé',
      telephoneClient: clients.find((c) => c.id === d.clientId)?.telephone || '',
    }));
  }, []);

  async function ajouterDette(clientId, montant, venteId = null) {
    const maintenant = new Date().toISOString();
    await db.transaction('rw', db.dettes, db.clients, async () => {
      await db.dettes.add({
        id: crypto.randomUUID(), clientId, montant, venteId,
        date: maintenant, statut: 'retard', updatedAt: maintenant, deleted: false,
      });
      const client = await db.clients.get(clientId);
      await db.clients.update(clientId, { solde: (client.solde || 0) + montant, updatedAt: maintenant });
    });
  }

  async function reglerDette(detteId) {
    const dette = await db.dettes.get(detteId);
    const maintenant = new Date().toISOString();
    await db.transaction('rw', db.dettes, db.clients, async () => {
      await db.dettes.update(detteId, { statut: 'reglee', updatedAt: maintenant });
      const client = await db.clients.get(dette.clientId);
      await db.clients.update(dette.clientId, { solde: (client.solde || 0) - dette.montant, updatedAt: maintenant });
    });
  }

  return { dettes: dettes || [], ajouterDette, reglerDette };
}