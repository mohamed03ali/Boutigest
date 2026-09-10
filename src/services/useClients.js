import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useClients() {
  const [clients, setClients] = useState([]);

  const recharger = useCallback(async () => {
    const tous = await db.clients.orderBy('nom').toArray();
    setClients(tous);
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function ajouterClient(donnees) {
    await db.clients.add({ ...donnees, solde: 0 });
    await recharger();
  }

  async function modifierClient(id, donnees) {
    await db.clients.update(id, donnees);
    await recharger();
  }

  return { clients, ajouterClient, modifierClient, recharger };
}
