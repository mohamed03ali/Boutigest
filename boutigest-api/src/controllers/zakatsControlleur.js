import db from '../config/db.js';

export async function lister(req, res) {
  try {
    const [zakats] = await db.query(
      'SELECT * FROM zakats WHERE boutique_id = ? ORDER BY date DESC',
      [req.utilisateur.boutiqueId]
    );
    res.json(zakats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function creer(req, res) {
  const {
    argentCaisse, argentBanque, valeurStock, creances,
    dettesCourtTerme, nisab,
  } = req.body;

  const richesseSoumise = argentCaisse + argentBanque + valeurStock + creances - dettesCourtTerme;
  const eligible = richesseSoumise >= nisab;
  const montantZakat = eligible ? richesseSoumise * 0.025 : 0;

  try {
    const [resultat] = await db.query(
      `INSERT INTO zakats (boutique_id, date, argent_caisse, argent_banque, valeur_stock, creances,
       dettes_court_terme, nisab, richesse_soumise, montant_zakat, paye)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [req.utilisateur.boutiqueId, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat]
    );
    res.status(201).json({ id: resultat.insertId, richesseSoumise, montantZakat, paye: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}

export async function marquerPaye(req, res) {
  const { id } = req.params;
  try {
    const [resultat] = await db.query(
      'UPDATE zakats SET paye = TRUE WHERE id = ? AND boutique_id = ?',
      [id, req.utilisateur.boutiqueId]
    );
    if (resultat.affectedRows === 0) return res.status(404).json({ erreur: 'Calcul introuvable.' });
    res.json({ id, paye: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
}