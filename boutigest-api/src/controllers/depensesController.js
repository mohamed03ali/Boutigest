import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [depenses] = await db.query(
      'SELECT * FROM depenses WHERE boutique_id = ? ORDER BY date DESC',
      [req.utilisateur.boutiqueId]
    );
    res.json(depenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const { libelle, montant, categorie } = req.body;
  if (!libelle || montant === undefined) {
    return res.status(400).json({ erreur: 'Libellé et montant sont obligatoires.' });
  }

  try {
    const [resultat] = await db.query(
      'INSERT INTO depenses (boutique_id, libelle, montant, categorie, date) VALUES (?, ?, ?, ?, NOW())',
      [req.utilisateur.boutiqueId, libelle, montant, categorie || null]
    );
    res.status(201).json({ id: resultat.insertId, libelle, montant, categorie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function supprimer(req, res) {
  const { id } = req.params;
  try {
    const [resultat] = await db.query(
      'DELETE FROM depenses WHERE id = ? AND boutique_id = ?',
      [id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) return res.status(404).json({ erreur: 'Dépense introuvable.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}