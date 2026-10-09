import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useInventaires() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const inventaires = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const liste = await db.inventaires.where('boutiqueId').equals(boutiqueId).and((i) => !i.deleted).toArray();
    return liste.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [boutiqueId]);

  async function demarrerInventaire(type) {
    if (!boutiqueId) return null;
    const maintenant = new Date().toISOString();
    const inventaireId = crypto.randomUUID();
    await db.inventaires.add({
      id: inventaireId,
      date: maintenant,
      type,
      statut: 'en_cours',
      boutiqueId,
      updatedAt: maintenant,
      deleted: false,
    });
    return inventaireId;
  }

  async function enregistrerComptage(inventaireId, produit, stockReel, motif = null) {
    const ecart = stockReel - produit.stock;
    await db.inventaireLignes.add({
      id: crypto.randomUUID(),
      inventaireId,
      produitId: produit.id,
      stockTheorique: produit.stock,
      stockReel,
      ecart,
      motif,
      updatedAt: new Date().toISOString(),
      deleted: false,
    });
  }

  async function validerInventaire(inventaireId) {
    const lignes = await db.inventaireLignes.where('inventaireId').equals(inventaireId).toArray();
    const maintenant = new Date().toISOString();

    await db.transaction('rw', db.produits, db.mouvementsStock, db.inventaires, async () => {
      for (const ligne of lignes) {
        if (ligne.ecart === 0) continue;

        await db.produits.update(ligne.produitId, {
          stock: ligne.stockReel,
          updatedAt: maintenant,
        });

        await db.mouvementsStock.add({
          id: crypto.randomUUID(),
          produitId: ligne.produitId,
          type: ligne.ecart > 0 ? 'ajustement_positif' : 'ajustement_negatif',
          quantite: ligne.ecart,
          stockAvant: ligne.stockTheorique,
          stockApres: ligne.stockReel,
          motif: ligne.motif,
          referenceId: inventaireId,
          utilisateurId: user?.id ?? null,
          boutiqueId,
          date: maintenant,
          updatedAt: maintenant,
          deleted: false,
        });
      }

      await db.inventaires.update(inventaireId, { statut: 'valide', updatedAt: maintenant });
    });
  }

  return { inventaires: inventaires || [], demarrerInventaire, enregistrerComptage, validerInventaire };
}

export function useInventaireDetail(inventaireId) {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const detail = useLiveQuery(async () => {
    if (!inventaireId || !boutiqueId) return null;
    const inventaire = await db.inventaires.get(inventaireId);
    const lignes = await db.inventaireLignes.where('inventaireId').equals(inventaireId).filter((l) => !l.deleted).toArray();
    const produits = await db.produits.where('boutiqueId').equals(boutiqueId).toArray();

    const lignesEnrichies = lignes.map((l) => ({
      ...l,
      nomProduit: produits.find((p) => p.id === l.produitId)?.nom || 'Produit supprimé',
      prixAchat: produits.find((p) => p.id === l.produitId)?.prixAchat || 0,
    }));

    const conformes = lignesEnrichies.filter((l) => l.ecart === 0).length;
    const ecartsPositifs = lignesEnrichies.filter((l) => l.ecart > 0).length;
    const ecartsNegatifs = lignesEnrichies.filter((l) => l.ecart < 0).length;

    const valeurTheorique = lignesEnrichies.reduce((sum, l) => sum + l.stockTheorique * l.prixAchat, 0);
    const valeurReelle = lignesEnrichies.reduce((sum, l) => sum + l.stockReel * l.prixAchat, 0);

    const topPertes = lignesEnrichies.filter((l) => l.ecart < 0).sort((a, b) => a.ecart - b.ecart).slice(0, 5);

    return {
      inventaire, lignes: lignesEnrichies, conformes, ecartsPositifs, ecartsNegatifs,
      valeurTheorique, valeurReelle, ecartValeur: valeurReelle - valeurTheorique, topPertes,
    };
  }, [inventaireId, boutiqueId]);

  return detail;
}