import jwt from 'jsonwebtoken';
import '../config/env.js';

export function verifierToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decode; // { id, role }
    next();
  } catch {
    return res.status(401).json({ erreur: 'Token invalide ou expiré.' });
  }
}
