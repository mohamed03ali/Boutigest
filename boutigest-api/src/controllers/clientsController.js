import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [clients] = await db.query(
      'SELECT * FROM clients WHERE boutique_id = ? ORDER BY nom',
      [req.utilisateur.boutiqueId]
    );
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const { nom, telephone } = req.body;
  if (!nom || !telephone) {
    return res.status(400).json({ erreur: 'Nom et téléphone sont obligatoires.' });
  }
  try {
    const [resultat] = await db.query(
      'INSERT INTO clients (boutique_id, nom, telephone, solde) VALUES (?, ?, ?, 0)',
      [req.utilisateur.boutiqueId, nom, telephone]
    );
    res.status(201).json({ id: resultat.insertId, nom, telephone, solde: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function modifier(req, res) {
  const { id } = req.params;
  const { nom, telephone } = req.body;
  try {
    const [resultat] = await db.query(
      'UPDATE clients SET nom = ?, telephone = ? WHERE id = ? AND boutique_id = ?',
      [nom, telephone, id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) return res.status(404).json({ erreur: 'Client introuvable.' });
    res.json({ id, nom, telephone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

