import { useState, useEffect } from 'react';
import { db } from '../db/db';

export function useDashboardActivite() {
  const [activites, setActivites] = useState([]);
  const [produitsStockFaible, setProduitsStockFaible] = useState([]);

  useEffect(() => {
    async function charger() {
      const ventes = await db.ventes.orderBy('date').reverse().limit(3).toArray();
      const mouvements = await db.mouvementsStock.orderBy('date').reverse().limit(2).toArray();

      const activitesVentes = ventes.map((v) => ({
        id: `vente-${v.id}`,
        type: 'vente',
        titre: `Vente #${v.id}`,
        sousTitre: 'Encaissée',
        montant: `${v.total.toLocaleString('fr-FR')} FCFA`,
        date: v.date,
      }));

      const activitesStock = mouvements.map((m) => ({
        id: `stock-${m.id}`,
        type: 'stock',
        titre: `Mouvement produit #${m.produitId}`,
        sousTitre: m.type === 'entree' ? 'Entrée stock' : 'Sortie stock',
        montant: `${m.quantite} unités`,
        date: m.date,
      }));

      const toutes = [...activitesVentes, ...activitesStock]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
      setActivites(toutes);

      const produits = await db.produits.toArray();
      const faibles = produits
        .filter((p) => p.stock <= (p.seuilReappro || 10))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 3);
      setProduitsStockFaible(faibles);
    }
    charger();
  }, []);

  return { activites, produitsStockFaible };
}


