import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE boutique_id = ? ORDER BY date DESC LIMIT 20',
      [req.utilisateur.boutiqueId]
    );
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function marquerLue(req, res) {
  const { id } = req.params;
  try {
    const [resultat] = await db.query(
      'UPDATE notifications SET lue = TRUE WHERE id = ? AND boutique_id = ?',
      [id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) return res.status(404).json({ erreur: 'Notification introuvable.' });
    res.json({ id, lue: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}