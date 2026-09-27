import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [utilisateurs] = await db.query(
      'SELECT id, nom, telephone, email, role FROM utilisateurs WHERE boutique_id = ? ORDER BY nom',
      [req.utilisateur.boutiqueId]
    );
    res.json(utilisateurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  if (req.utilisateur.role !== 'admin') {
    return res.status(403).json({ erreur: 'Seul un administrateur peut ajouter un utilisateur.' });
  }

  const { nom, telephone, email, motDePasse, role } = req.body;
  if (!nom || !telephone || !motDePasse) {
    return res.status(400).json({ erreur: 'Nom, téléphone et mot de passe sont obligatoires.' });
  }

  try {
    const [existants] = await db.query('SELECT id FROM utilisateurs WHERE telephone = ?', [telephone]);
    if (existants.length > 0) {
      return res.status(409).json({ erreur: 'Un compte existe déjà avec ce numéro.' });
    }

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);
    const [resultat] = await db.query(
      'INSERT INTO utilisateurs (boutique_id, nom, telephone, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?)',
      [req.utilisateur.boutiqueId, nom, telephone, email || null, motDePasseHache, role || 'vendeur']
    );
    res.status(201).json({ id: resultat.insertId, nom, telephone, email, role: role || 'vendeur' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function supprimer(req, res) {
  if (req.utilisateur.role !== 'admin') {
    return res.status(403).json({ erreur: 'Seul un administrateur peut supprimer un utilisateur.' });
  }

  const { id } = req.params;
  try {
    const [resultat] = await db.query(
      "DELETE FROM utilisateurs WHERE id = ? AND boutique_id = ? AND role != 'admin'",
      [id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) return res.status(404).json({ erreur: 'Utilisateur introuvable ou non supprimable.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}