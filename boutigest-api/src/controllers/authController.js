import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';


export async function register(req, res) {
  const { nom, telephone, email, motDePasse, boutiqueId, role } = req.body;

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
      [boutiqueId || null, nom, telephone, email || null, motDePasseHache, role || 'admin']
    );

    const roleUtilisateur = role || 'admin';
    const token = jwt.sign(
      { id: resultat.insertId, role: roleUtilisateur, boutiqueId: boutiqueId || null },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );


    res.status(201).json({ id: resultat.insertId, nom, telephone, role: roleUtilisateur, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function login(req, res) {
  const { telephone, motDePasse } = req.body;

  if (!telephone || !motDePasse) {
    return res.status(400).json({ erreur: 'Téléphone et mot de passe sont obligatoires.' });
  }

  try {
    const [utilisateurs] = await db.query('SELECT * FROM utilisateurs WHERE telephone = ?', [telephone]);
    if (utilisateurs.length === 0) {
      return res.status(401).json({ erreur: 'Identifiants incorrects.' });
    }

    const utilisateur = utilisateurs[0];
    const valide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ erreur: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
  { id: utilisateur.id, role: utilisateur.role, boutiqueId: utilisateur.boutique_id },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);


    res.json({
      id: utilisateur.id, nom: utilisateur.nom, telephone: utilisateur.telephone,
      role: utilisateur.role, boutiqueId: utilisateur.boutique_id, token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}


