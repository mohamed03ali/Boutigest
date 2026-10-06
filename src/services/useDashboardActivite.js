import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useDashboardActivite() {
  const resultat = useLiveQuery(async () => {
    const ventes = await db.ventes.orderBy('date').reverse().filter((v) => !v.deleted).limit(3).toArray();
    const mouvements = await db.mouvementsStock.orderBy('date').reverse().filter((m) => !m.deleted).limit(2).toArray();
    const produits = await db.produits.filter((p) => !p.deleted).toArray();
    const clients = await db.clients.filter((c) => !c.deleted).toArray();

    const activitesVentes = ventes.map((v) => {
      const client = clients.find((c) => c.id === v.clientId);
      return {
        id: `vente-${v.id}`,
        type: 'vente',
        titre: client ? `Vente — ${client.nom}` : 'Vente comptoir',
        sousTitre: v.modePaiement === 'credit' ? 'À crédit' : 'Encaissée',
        montant: `${v.total.toLocaleString('fr-FR')} FCFA`,
        date: v.date,
      };
    });

    const activitesStock = mouvements.map((m) => {
      const produit = produits.find((p) => p.id === m.produitId);
      return {
        id: `stock-${m.id}`,
        type: 'stock',
        titre: produit?.nom || 'Produit supprimé',
        sousTitre: m.type === 'entree' ? 'Entrée stock' : 'Sortie stock',
        montant: `${m.quantite} unités`,
        date: m.date,
      };
    });

    const activites = [...activitesVentes, ...activitesStock]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    // corrigé : `quantite` / `seuilAlerte`, pas `stock` / `seuilReappro`
    // — ces derniers n'existent sur aucun produit, donc la comparaison
    // `undefined <= 10` renvoyait toujours false et la liste restait vide
    const produitsStockFaible = produits
      .filter((p) => p.stock <= (p.seuilReappro || 10))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);

    return { activites, produitsStockFaible };
  }, []);

  return {
    activites: resultat?.activites || [],
    produitsStockFaible: resultat?.produitsStockFaible || [],
  };
}