import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useDettes() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const dettes = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const toutes = await db.dettes.where('boutiqueId').equals(boutiqueId).and((d) => !d.deleted).toArray();
    const clients = await db.clients.where('boutiqueId').equals(boutiqueId).and((c) => !c.deleted).toArray();
    return toutes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((d) => ({
        ...d,
        nomClient: clients.find((c) => c.id === d.clientId)?.nom || 'Client supprimé',
        telephoneClient: clients.find((c) => c.id === d.clientId)?.telephone || '',
      }));
  }, [boutiqueId]);

  async function ajouterDette(clientId, montant, venteId = null) {
    if (!boutiqueId) return;
    const maintenant = new Date().toISOString();
    await db.transaction('rw', db.dettes, db.clients, async () => {
      await db.dettes.add({
        id: crypto.randomUUID(), clientId, montant, venteId, boutiqueId,
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