import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import '../config/env.js';

export async function verifierToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = {
      ...decode,
      boutiqueId: decode.boutiqueId ?? decode.boutique_id ?? null,
    };

    if (!utilisateur.boutiqueId && utilisateur.id) {
      const [resultats] = await db.query('SELECT boutique_id FROM utilisateurs WHERE id = ?', [utilisateur.id]);
      utilisateur.boutiqueId = resultats[0]?.boutique_id ?? null;
    }

    req.utilisateur = utilisateur;
    next();
  } catch {
    return res.status(401).json({ erreur: 'Token invalide ou expiré.' });
  }
}