import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useActiviteComplete(filtre = 'toutes') {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const activites = useLiveQuery(async () => {
    if (!boutiqueId) return [];

    const ventes = await db.ventes
      .orderBy('date').reverse()
      .filter((v) => !v.deleted && v.boutiqueId === boutiqueId)
      .toArray();
    const mouvements = await db.mouvementsStock
      .orderBy('date').reverse()
      .filter((m) => !m.deleted && m.boutiqueId === boutiqueId)
      .toArray();
    const produits = await db.produits
      .filter((p) => !p.deleted && p.boutiqueId === boutiqueId)
      .toArray();
    const clients = await db.clients
      .filter((c) => !c.deleted && c.boutiqueId === boutiqueId)
      .toArray();

    const activitesVentes = ventes.map((v) => {
      const client = clients.find((c) => c.id === v.clientId);
      return {
        id: `vente-${v.id}`,
        categorie: 'ventes',
        titre: client ? `Vente — ${client.nom}` : 'Vente comptoir',
        sousTitre: v.modePaiement === 'credit' ? 'À crédit' : 'Encaissée',
        montant: `${(v.total || 0).toLocaleString('fr-FR')} FCFA`,
        date: v.date,
      };
    });

    const activitesStock = mouvements.map((m) => {
      const produit = produits.find((p) => p.id === m.produitId);
      return {
        id: `stock-${m.id}`,
        categorie: 'stock',
        titre: produit?.nom || 'Produit supprimé',
        sousTitre: m.type === 'entree' ? 'Entrée stock' : 'Sortie stock',
        montant: `${m.quantite} unités`,
        date: m.date,
      };
    });

    return [...activitesVentes, ...activitesStock].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [boutiqueId]);

  const toutes = activites || [];
  const activitesFiltrees = toutes.filter((a) => filtre === 'toutes' || a.categorie === filtre);

  return { activitesFiltrees };
}