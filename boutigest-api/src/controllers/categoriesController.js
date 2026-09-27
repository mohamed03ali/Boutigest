import db from '../config/db.js';

export async function lister(req, res) {
  const { type } = req.query;
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE boutique_id = ? AND type = ?',
      [req.utilisateur.boutiqueId, type]
    );
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const { type, nom, icone } = req.body;
  if (!type || !nom) return res.status(400).json({ erreur: 'Type et nom sont obligatoires.' });

  try {
    const [resultat] = await db.query(
      'INSERT INTO categories (boutique_id, type, nom, icone) VALUES (?, ?, ?, ?)',
      [req.utilisateur.boutiqueId, type, nom, icone || null]
    );
    res.status(201).json({ id: resultat.insertId, type, nom, icone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}