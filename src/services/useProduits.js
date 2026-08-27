import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useProduits() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);

  const recharger = useCallback(async () => {
    const tous = await db.produits.orderBy('nom').toArray();
    setProduits(tous);
    setChargement(false);
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function ajouterProduit(donnees) {
    await db.produits.add(donnees);
    await recharger();
  }

  async function modifierProduit(id, donnees) {
    await db.produits.update(id, donnees);
    await recharger();
  }

  async function supprimerProduit(id) {
    await db.produits.delete(id);
    await recharger();
  }

  return { produits, chargement, ajouterProduit, modifierProduit, supprimerProduit };
}
