import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';
import { TYPES_MOUVEMENT } from '../composant/constants/mouvementsStock';

export function useDashboardActivite() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const resultat = useLiveQuery(async () => {
    if (!boutiqueId) return { activites: [], produitsStockFaible: [] };

    const ventes = (await db.ventes.where('boutiqueId').equals(boutiqueId).and((v) => !v.deleted).toArray())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    const mouvements = (await db.mouvementsStock.where('boutiqueId').equals(boutiqueId).and((m) => !m.deleted).toArray())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
    const produits = await db.produits.where('boutiqueId').equals(boutiqueId).and((p) => !p.deleted).toArray();
    const clients = await db.clients.where('boutiqueId').equals(boutiqueId).and((c) => !c.deleted).toArray();

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
      const info = TYPES_MOUVEMENT[m.type] || { label: m.type, sens: m.quantite >= 0 ? 'entree' : 'sortie' };
      return {
        id: `stock-${m.id}`,
        type: 'stock',
        titre: produit?.nom || 'Produit supprimé',
        sousTitre: info.label,
        montant: `${m.quantite > 0 ? '+' : ''}${m.quantite} unités`,
        date: m.date,
      };
    });

    const activites = [...activitesVentes, ...activitesStock]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    const produitsStockFaible = produits
      .filter((p) => p.stock > 0 && p.stock <= (p.seuilReappro || 10))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);

    return { activites, produitsStockFaible };
  }, [boutiqueId]);

  return {
    activites: resultat?.activites || [],
    produitsStockFaible: resultat?.produitsStockFaible || [],
  };
}