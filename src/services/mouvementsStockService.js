import { db } from '../db/db';

export async function enregistrerMouvement({
  produitId,
  type,
  quantite,
  motif = null,
  referenceId = null,
  utilisateurId = null,
  boutiqueId,
}) {
  if (!produitId) throw new Error('produitId est obligatoire.');
  if (!type) throw new Error('type est obligatoire.');
  if (!quantite) throw new Error('quantite est obligatoire et ne peut pas être 0.');
  if (!boutiqueId) throw new Error('boutiqueId est obligatoire.');

  return db.transaction('rw', db.produits, db.mouvementsStock, async () => {
    const produit = await db.produits.get(produitId);
    if (!produit) throw new Error('Produit introuvable.');

    const stockAvant = Number(produit.stock) || 0;
    const stockApres = stockAvant + quantite;
    const maintenant = new Date().toISOString();

    await db.produits.update(produitId, { stock: stockApres, updatedAt: maintenant });

    const mouvement = {
      id: crypto.randomUUID(),
      produitId, type, quantite, stockAvant, stockApres,
      motif, referenceId, utilisateurId, boutiqueId,
      date: maintenant, updatedAt: maintenant, deleted: false,
    };
    await db.mouvementsStock.add(mouvement);
    return mouvement;
  });
}