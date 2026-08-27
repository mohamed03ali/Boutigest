import Dexie from 'dexie';

export const db = new Dexie('BoutigestDB');

db.version(1).stores({
  produits: '++id, nom, categorie, prixVente, prixAchat, stock,seuilReappro ,sku',
  ventes: '++id, date, total, clientId',
  venteLignes: '++id, venteId, produitId, quantite, prixUnitaire',
  mouvementsStock: '++id, produitId, type, quantite, date', // type: 'entree' | 'sortie'
  clients: '++id, nom, telephone, solde',
  dettes: '++id, clientId, montant, date, statut', // statut: 'retard' | 'reglee'
  depenses: '++id, libelle, montant, categorie, date',
  utilisateurs: '++id, nom, email,telephone, motDePasse, role',
  boutiques: '++id, nom, typeCommerce, devise, utilisateurId',
});
