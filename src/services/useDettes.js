import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useDettes() {
  const [dettes, setDettes] = useState([]);

  const recharger = useCallback(async () => {
    const toutes = await db.dettes.orderBy('date').reverse().toArray();
    const clients = await db.clients.toArray();
    const enrichies = toutes.map((d) => ({
      ...d,
      nomClient: clients.find((c) => c.id === d.clientId)?.nom || 'Client supprimé',
      telephoneClient: clients.find((c) => c.id === d.clientId)?.telephone || '',
    }));
    setDettes(enrichies);
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function ajouterDette(clientId, montant) {
    await db.transaction('rw', db.dettes, db.clients, async () => {
      await db.dettes.add({
        clientId, montant, date: new Date().toISOString(), statut: 'retard',
      });
      const client = await db.clients.get(clientId);
      await db.clients.update(clientId, { solde: (client.solde || 0) + montant });
    });
    await recharger();
  }

  async function reglerDette(detteId) {
    const dette = await db.dettes.get(detteId);
    await db.transaction('rw', db.dettes, db.clients, async () => {
      await db.dettes.update(detteId, { statut: 'reglee' });
      const client = await db.clients.get(dette.clientId);
      await db.clients.update(dette.clientId, { solde: (client.solde || 0) - dette.montant });
    });
    await recharger();
  }

  return { dettes, ajouterDette, reglerDette };
}
    