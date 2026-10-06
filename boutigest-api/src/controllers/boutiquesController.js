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

    await db.query('UPDATE utilisateurs SET boutique_id = ? WHERE id = ?', [id, req.utilisateur.id]);

    res.status(201).json({ id, nom, typeCommerce, devise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function obtenir(req, res) {
  try {
    const [boutiques] = await db.query('SELECT * FROM boutiques WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (boutiques.length === 0) return res.status(404).json({ erreur: 'Aucune boutique trouvée.' });
    res.json(boutiques[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}