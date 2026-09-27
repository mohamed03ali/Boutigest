import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [ventes] = await db.query(
      'SELECT * FROM ventes WHERE boutique_id = ? ORDER BY date DESC',
      [req.utilisateur.boutiqueId]
    );
    res.json(ventes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const { clientId, total, remise, modePaiement, lignes } = req.body;
  // lignes: [{ produitId, quantite, prixUnitaire }]

  if (!lignes || lignes.length === 0) {
    return res.status(400).json({ erreur: 'Une vente doit contenir au moins un produit.' });
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    for (const ligne of lignes) {
      const [[produit]] = await connexion.query(
        'SELECT stock FROM produits WHERE id = ? AND boutique_id = ? FOR UPDATE',
        [ligne.produitId, req.utilisateur.boutiqueId]
      );
      if (!produit || produit.stock < ligne.quantite) {
        throw new Error(`Stock insuffisant pour le produit #${ligne.produitId}.`);
      }
    }

    const [venteResultat] = await connexion.query(
      `INSERT INTO ventes (boutique_id, client_id, date, total, remise, mode_paiement)
       VALUES (?, ?, NOW(), ?, ?, ?)`,
      [req.utilisateur.boutiqueId, clientId || null, total, remise || 0, modePaiement || 'cash']
    );
    const venteId = venteResultat.insertId;

    for (const ligne of lignes) {
      await connexion.query(
        'INSERT INTO vente_lignes (vente_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
        [venteId, ligne.produitId, ligne.quantite, ligne.prixUnitaire]
      );
      await connexion.query(
        'UPDATE produits SET stock = stock - ? WHERE id = ?',
        [ligne.quantite, ligne.produitId]
      );
      await connexion.query(
        `INSERT INTO mouvements_stock (boutique_id, produit_id, type, quantite, date)
         VALUES (?, ?, 'sortie', ?, NOW())`,
        [req.utilisateur.boutiqueId, ligne.produitId, ligne.quantite]
      );
    }

    if (modePaiement === 'credit' && clientId) {
      await connexion.query(
        `INSERT INTO dettes (boutique_id, client_id, vente_id, montant, date, statut)
         VALUES (?, ?, ?, ?, NOW(), 'retard')`,
        [req.utilisateur.boutiqueId, clientId, venteId, total]
      );
      await connexion.query(
        'UPDATE clients SET solde = solde + ? WHERE id = ?',
        [total, clientId]
      );
    }

    await connexion.commit();
    res.status(201).json({ id: venteId, total });
  } catch (err) {
    await connexion.rollback();
    console.error(err);
    res.status(400).json({ erreur: err.message || 'Erreur lors de la vente.' });
  } finally {
    connexion.release();
  }
}

