import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [mouvements] = await db.query(
      `SELECT m.*, p.nom AS nom_produit
       FROM mouvements_stock m
       JOIN produits p ON p.id = m.produit_id
       WHERE m.boutique_id = ?
       ORDER BY m.date DESC
       LIMIT 50`,
      [req.utilisateur.boutiqueId]
    );
    res.json(mouvements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function ajusterInventaire(req, res) {
  const { ajustements } = req.body; // [{ produitId, nouveauStock }]
  if (!ajustements || ajustements.length === 0) {
    return res.status(400).json({ erreur: 'Aucun ajustement fourni.' });
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    for (const a of ajustements) {
      const [[produit]] = await connexion.query(
        'SELECT stock FROM produits WHERE id = ? AND boutique_id = ? FOR UPDATE',
        [a.produitId, req.utilisateur.boutiqueId]
      );
      if (!produit) throw new Error(`Produit #${a.produitId} introuvable.`);

      const ecart = a.nouveauStock - produit.stock;
      if (ecart === 0) continue;

      await connexion.query('UPDATE produits SET stock = ? WHERE id = ?', [a.nouveauStock, a.produitId]);
      await connexion.query(
        `INSERT INTO mouvements_stock (boutique_id, produit_id, type, quantite, date)
         VALUES (?, ?, ?, ?, NOW())`,
        [req.utilisateur.boutiqueId, a.produitId, ecart > 0 ? 'entree' : 'sortie', Math.abs(ecart)]
      );
    }

    await connexion.commit();
    res.json({ message: 'Inventaire ajusté.' });
  } catch (err) {
    await connexion.rollback();
    console.error(err);
    res.status(400).json({ erreur: err.message || 'Erreur lors de l\'ajustement.' });
  } finally {
    connexion.release();
  }
}