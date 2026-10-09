import { randomUUID } from 'crypto';
import db from '../config/db.js';

export async function creer(req, res) {
  const { nom, typeCommerce, devise } = req.body;
  if (!nom) {
    return res.status(400).json({ erreur: 'Le nom de la boutique est obligatoire.' });
  }

  try {
    const id = randomUUID();

    await db.query(
      'INSERT INTO boutiques (id, utilisateur_id, nom, type_commerce, devise) VALUES (?, ?, ?, ?, ?)',
      [id, req.utilisateur.id, nom, typeCommerce || null, devise || 'CFA - Franc CFA']
    );

    // La boutique nouvellement créée devient la boutique active de l'utilisateur
    await db.query('UPDATE utilisateurs SET boutique_id = ? WHERE id = ?', [id, req.utilisateur.id]);

    res.status(201).json({ id, nom, typeCommerce, devise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

// Renvoie TOUTES les boutiques de l'utilisateur connecté (remplace l'ancien "obtenir").
export async function lister(req, res) {
  try {
    const [boutiques] = await db.query(
      'SELECT * FROM boutiques WHERE utilisateur_id = ?',
      [req.utilisateur.id]
    );
    res.json(boutiques);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

// Change la boutique active de l'utilisateur.
export async function definirActive(req, res) {
  const { boutiqueId } = req.body;
  if (!boutiqueId) {
    return res.status(400).json({ erreur: 'boutiqueId est obligatoire.' });
  }

  try {
    // On vérifie que la boutique appartient bien à l'utilisateur avant de l'activer
    const [boutiques] = await db.query(
      'SELECT id FROM boutiques WHERE id = ? AND utilisateur_id = ?',
      [boutiqueId, req.utilisateur.id]
    );
    if (boutiques.length === 0) {
      return res.status(404).json({ erreur: 'Boutique introuvable.' });
    }

    await db.query('UPDATE utilisateurs SET boutique_id = ? WHERE id = ?', [boutiqueId, req.utilisateur.id]);
    res.json({ boutiqueId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}