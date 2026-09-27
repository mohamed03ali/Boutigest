import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [dettes] = await db.query(
      `SELECT d.*, c.nom AS nom_client, c.telephone AS telephone_client
       FROM dettes d
       JOIN clients c ON c.id = d.client_id
       WHERE d.boutique_id = ?
       ORDER BY d.date DESC`,
      [req.utilisateur.boutiqueId]
    );
    res.json(dettes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function marquerReglee(req, res) {
  const { id } = req.params;
  const connexion = await db.getConnection();

  try {
    await connexion.beginTransaction();

    const [[dette]] = await connexion.query(
      'SELECT * FROM dettes WHERE id = ? AND boutique_id = ?',
      [id, req.utilisateur.boutiqueId]
    );
    if (!dette) {
      await connexion.rollback();
      return res.status(404).json({ erreur: 'Dette introuvable.' });
    }
    if (dette.statut === 'reglee') {
      await connexion.rollback();
      return res.status(400).json({ erreur: 'Cette dette est déjà réglée.' });
    }

    await connexion.query('UPDATE dettes SET statut = ? WHERE id = ?', ['reglee', id]);
    await connexion.query('UPDATE clients SET solde = solde - ? WHERE id = ?', [dette.montant, dette.client_id]);

    await connexion.commit();
    res.json({ id, statut: 'reglee' });
  } catch (err) {
    await connexion.rollback();
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  } finally {
    connexion.release();
  }
}