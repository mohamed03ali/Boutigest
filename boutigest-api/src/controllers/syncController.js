// src/controllers/syncController.js
import db from '../config/db.js';

const TABLES = {
  produits: ['id', 'boutique_id', 'nom', 'categorie', 'prix_vente', 'prix_achat', 'stock', 'seuil_reappro', 'sku'],
  clients: ['id', 'boutique_id', 'nom', 'telephone', 'solde'],
  ventes: ['id', 'boutique_id', 'client_id', 'date', 'total', 'remise', 'mode_paiement'],
  vente_lignes: ['id', 'vente_id', 'produit_id', 'quantite', 'prix_unitaire'],
  mouvements_stock: ['id', 'boutique_id', 'produit_id', 'type', 'quantite', 'date'],
  dettes: ['id', 'boutique_id', 'client_id', 'vente_id', 'montant', 'date', 'statut'],
  depenses: ['id', 'boutique_id', 'libelle', 'montant', 'categorie', 'date'],
  categories: ['id', 'boutique_id', 'type', 'nom', 'icone'],
  zakats: ['id', 'boutique_id', 'date', 'argent_caisse', 'argent_banque', 'valeur_stock', 'creances', 'dettes_court_terme', 'nisab', 'richesse_soumise', 'montant_zakat', 'paye'],
  notifications: ['id', 'boutique_id', 'type', 'titre', 'message', 'reference_id', 'lue', 'date'],
  inventaires: ['id', 'boutique_id', 'date', 'type', 'statut'],
  inventaire_lignes: ['id', 'inventaire_id', 'produit_id', 'stock_theorique', 'stock_reel', 'ecart', 'motif'],
};

function versSnakeCase(objet) {
  const resultat = {};
  for (const [cle, valeur] of Object.entries(objet)) {
    const cleSnake = cle.replace(/[A-Z]/g, (lettre) => `_${lettre.toLowerCase()}`);
    resultat[cleSnake] = valeur;
  }
  return resultat;
}

function versCamelCase(objet) {
  const resultat = {};
  for (const [cle, valeur] of Object.entries(objet)) {
    const cleCamel = cle.replace(/_([a-z])/g, (_, lettre) => lettre.toUpperCase());
    resultat[cleCamel] = valeur;
  }
  return resultat;
}

function toCamel(nomSnake) {
  return nomSnake.replace(/_([a-z])/g, (_, lettre) => lettre.toUpperCase());
}

// boutigest-api/src/controllers/syncController.js
export async function push(req, res) {
  const { changements } = req.body;
  const boutiqueId = req.utilisateur.boutiqueId;

  if (!boutiqueId) {
    return res.status(400).json({ erreur: 'Aucune boutique associée à ce compte.' });
  }

  const resultats = {};

  for (const [nomTable, colonnes] of Object.entries(TABLES)) {
    const lignesRecues = changements[toCamel(nomTable)] || [];
    resultats[nomTable] = { acceptes: 0, ignores: 0, erreurs: 0 };

    for (const ligne of lignesRecues) {
      try {
        const ligneSnake = versSnakeCase(ligne);
        if (colonnes.includes('boutique_id')) {
          ligneSnake.boutique_id = boutiqueId;
        }

        const [[existant]] = await db.query(
          `SELECT updated_at FROM ${nomTable} WHERE id = ?`,
          [ligneSnake.id]
        );

        if (existant) {
          const dateServeur = new Date(existant.updated_at).getTime();
          const dateClient = new Date(ligne.updatedAt).getTime();
          if (dateClient <= dateServeur) {
            resultats[nomTable].ignores++;
            continue;
          }
          const setClause = colonnes.filter((c) => c !== 'id').map((c) => `${c} = ?`).join(', ');
          const valeurs = colonnes.filter((c) => c !== 'id').map((c) => ligneSnake[c]);
          await db.query(
            `UPDATE ${nomTable} SET ${setClause}, deleted = ? WHERE id = ?`,
            [...valeurs, ligne.deleted || false, ligneSnake.id]
          );
        } else {
          const colonnesAvecDeleted = [...colonnes, 'deleted'];
          const placeholders = colonnesAvecDeleted.map(() => '?').join(', ');
          const valeurs = colonnes.map((c) => ligneSnake[c]);
          await db.query(
            `INSERT INTO ${nomTable} (${colonnesAvecDeleted.join(', ')}) VALUES (${placeholders})`,
            [...valeurs, ligne.deleted || false]
          );
        }
        resultats[nomTable].acceptes++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // Course entre deux requêtes concurrentes : la ligne existe déjà, on l'ignore proprement
          resultats[nomTable].ignores++;
        } else {
          console.error(`Erreur sur ${nomTable} id=${ligne.id}:`, err.message);
          resultats[nomTable].erreurs++;
        }
        // On continue la boucle quoi qu'il arrive — jamais d'arrêt sur une seule ligne cassée
      }
    }
  }

  res.json({ resultats, syncAt: new Date().toISOString() });
}

export async function pull(req, res) {
  const { depuis } = req.query;
  const boutiqueId = req.utilisateur.boutiqueId;

  if (!boutiqueId) {
    return res.status(400).json({ erreur: 'Aucune boutique associée à ce compte.' });
  }

  const dateDepuis = depuis || '1970-01-01T00:00:00.000Z';
  const changements = {};

  try {
    for (const nomTable of Object.keys(TABLES)) {
      let lignes;
      if (nomTable === 'vente_lignes') {
        [lignes] = await db.query(
          `SELECT vl.* FROM vente_lignes vl
           JOIN ventes v ON v.id = vl.vente_id
           WHERE v.boutique_id = ? AND vl.updated_at > ?`,
          [boutiqueId, dateDepuis]
        );
      } else if (nomTable === 'inventaire_lignes') {
        [lignes] = await db.query(
          `SELECT il.* FROM inventaire_lignes il
           JOIN inventaires i ON i.id = il.inventaire_id
           WHERE i.boutique_id = ? AND il.updated_at > ?`,
          [boutiqueId, dateDepuis]
        );
      } else {
        [lignes] = await db.query(
          `SELECT * FROM ${nomTable} WHERE boutique_id = ? AND updated_at > ?`,
          [boutiqueId, dateDepuis]
        );
      }
      changements[toCamel(nomTable)] = lignes.map(versCamelCase);
    }

    res.json({ changements, syncAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la synchronisation.' });
  }
}