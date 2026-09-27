import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [produits] = await db.query(
      'SELECT * FROM produits WHERE boutique_id = ? ORDER BY nom',
      [req.utilisateur.boutiqueId]
    );
    res.json(produits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const { nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku } = req.body;
  if (!nom || prixVente === undefined || prixAchat === undefined) {
    return res.status(400).json({ erreur: 'Nom, prix de vente et prix d\'achat sont obligatoires.' });
  }

  try {
    const [resultat] = await db.query(
      `INSERT INTO produits (boutique_id, nom, categorie, prix_vente, prix_achat, stock, seuil_reappro, sku)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.utilisateur.boutiqueId, nom, categorie || null, prixVente, prixAchat, stock || 0, seuilReappro || 10, sku || null]
    );
    res.status(201).json({ id: resultat.insertId, nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function modifier(req, res) {
  const { id } = req.params;
  const { nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku } = req.body;

  try {
    const [resultat] = await db.query(
      `UPDATE produits SET nom = ?, categorie = ?, prix_vente = ?, prix_achat = ?, stock = ?, seuil_reappro = ?, sku = ?
       WHERE id = ? AND boutique_id = ?`,
      [nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku, id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) {
      return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    res.json({ id, nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function supprimer(req, res) {
  const { id } = req.params;
  try {
    const [resultat] = await db.query(
      'DELETE FROM produits WHERE id = ? AND boutique_id = ?',
      [id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) {
      return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}



 
