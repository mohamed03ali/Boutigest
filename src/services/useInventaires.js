// services/useInventaires.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useInventaires() {
  const inventaires = useLiveQuery(
    () => db.inventaires.orderBy('date').reverse().filter((i) => !i.deleted).toArray(),
    []
  );

  async function demarrerInventaire(produitsACompter) {
    const maintenant = new Date().toISOString();
    const inventaireId = crypto.randomUUID();

    await db.inventaires.add({
      id: inventaireId,
      date: maintenant,
      type: produitsACompter.length === undefined ? 'complet' : 'partiel',
      statut: 'en_cours',
      updatedAt: maintenant,
      deleted: false,
    });

    return inventaireId;
  }

  // appelé une fois par produit compté, avec la quantité réelle saisie
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

  // à l'appel de "Valider l'inventaire" : applique tous les écarts en une transaction,
  // trace chaque ajustement dans mouvementsStock, et ne touche jamais produit.stock à la main
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
          type: 'ajustement_inventaire',
          quantiteAvant: ligne.stockTheorique,
          quantiteApres: ligne.stockReel,
          difference: ligne.ecart,
          motif: ligne.motif,
          date: maintenant,
          updatedAt: maintenant,
          deleted: false,
        });
      }

      await db.inventaires.update(inventaireId, { statut: 'valide', updatedAt: maintenant });
    });
  }

  return { inventaires, demarrerInventaire, enregistrerComptage, validerInventaire };
}
// services/useInventaires.js — ajoute cette fonction à la fin du fichier
export function useInventaireDetail(inventaireId) {
  return useLiveQuery(async () => {
    if (!inventaireId) return null;
    const inventaire = await db.inventaires.get(inventaireId);
    const lignes = await db.inventaireLignes.where('inventaireId').equals(inventaireId).filter((l) => !l.deleted).toArray();
    const produits = await db.produits.toArray();

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
  }, [inventaireId]);
}