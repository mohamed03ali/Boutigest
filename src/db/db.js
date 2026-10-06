import Dexie from 'dexie';

export const db = new Dexie('BoutigestDB');

db.version(1).stores({
  produits: '++id, nom, categorie, prixVente, prixAchat, stock,seuilReappro ,sku',
  ventes: '++id, date, total, clientId,modePaiement',
  venteLignes: '++id, venteId, produitId, quantite, prixUnitaire',
  mouvementsStock: '++id, produitId, type, quantite, date', // type: 'entree' | 'sortie'
  clients: '++id, nom, telephone, solde',
  dettes: '++id, clientId, montant, date, statut,venteId', // statut: 'retard' | 'reglee'
  depenses: '++id, libelle, montant, categorie, date',
  utilisateurs: '++id, nom, email,telephone, motDePasse, role',
  boutiques: '++id, nom, typeCommerce, devise, utilisateurId',
  //categories:'++id,type,nom,icone',
});
db.version(2).stores({
  produits: '++id, nom, categorie, prixVente, prixAchat, stock,seuilReappro ,sku',
  ventes: '++id, date, total, clientId,modePaiement',
  venteLignes: '++id, venteId, produitId, quantite, prixUnitaire',
  mouvementsStock: '++id, produitId, type, quantite, date', // type: 'entree' | 'sortie'
  clients: '++id, nom, telephone, solde',
  dettes: '++id, clientId, montant, date, statut,venteId', // statut: 'retard' | 'reglee'
  depenses: '++id, libelle, montant, categorie, date',
  utilisateurs: '++id, nom, email,telephone, motDePasse, role',
  boutiques: '++id, nom, typeCommerce, devise, utilisateurId',
  zakats: '++id, date, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat, paye',
  //categories:'++id,type,nom,icone',
});
db.version(3).stores({
  produits: '++id, nom, categorie, prixVente, prixAchat, stock,seuilReappro ,sku',
  ventes: '++id, date, total, clientId,modePaiement',
  venteLignes: '++id, venteId, produitId, quantite, prixUnitaire',
  mouvementsStock: '++id, produitId, type, quantite, date', // type: 'entree' | 'sortie'
  clients: '++id, nom, telephone, solde',
  dettes: '++id, clientId, montant, date, statut,venteId', // statut: 'retard' | 'reglee'
  depenses: '++id, libelle, montant, categorie, date',
  utilisateurs: '++id, nom, email,telephone, motDePasse, role',
  boutiques: '++id, nom, typeCommerce, devise, utilisateurId',
  zakats: '++id, date, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat, paye',
  notifications: '++id, type, titre, message, date, lue', 
  //categories:'++id,type,nom,icone',
});
db.version(4).stores({
  produits: '++id, nom, categorie, prixVente, prixAchat, stock,seuilReappro ,sku',
  ventes: '++id, date, total, clientId,modePaiement',
  venteLignes: '++id, venteId, produitId, quantite, prixUnitaire',
  mouvementsStock: '++id, produitId, type, quantite, date', // type: 'entree' | 'sortie'
  clients: '++id, nom, telephone, solde',
  dettes: '++id, clientId, montant, date, statut,venteId', // statut: 'retard' | 'reglee'
  depenses: '++id, libelle, montant, categorie, date',
  utilisateurs: '++id, nom, email,telephone, motDePasse, role',
  boutiques: '++id, nom, typeCommerce, devise, utilisateurId',
  zakats: '++id, date, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat, paye',
  notifications: '++id, type, titre, message, date, lue, referenceId', 
  //categories:'++id,type,nom,icone',
});


db.version(5).stores({
  produits: 'id, nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku, updatedAt, deleted',
  ventes: 'id, date, total, clientId, modePaiement, updatedAt, deleted',
  venteLignes: 'id, venteId, produitId, quantite, prixUnitaire, updatedAt, deleted',
  mouvementsStock: 'id, produitId, type, quantite, date, updatedAt, deleted',
  clients: 'id, nom, telephone, solde, updatedAt, deleted',
  dettes: 'id, clientId, montant, date, statut, venteId, updatedAt, deleted',
  depenses: 'id, libelle, montant, categorie, date, updatedAt, deleted',
  utilisateurs: 'id, nom, email, telephone, motDePasse, role, updatedAt, deleted',
  boutiques: 'id, nom, typeCommerce, devise, utilisateurId, updatedAt, deleted',
  categories: 'id, type, nom, icone, updatedAt, deleted',
  zakats: 'id, date, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat, paye, updatedAt, deleted',
  notifications: 'id, type, titre, message, date, lue, referenceId, updatedAt, deleted',
  
});
db.version(6).stores({
  produits: 'id, nom, categorie, prixVente, prixAchat, stock, seuilReappro, sku, updatedAt, deleted',
  ventes: 'id, date, total, clientId, modePaiement, updatedAt, deleted',
  venteLignes: 'id, venteId, produitId, quantite, prixUnitaire, updatedAt, deleted',
  mouvementsStock: 'id, produitId, type, quantite, date, updatedAt, deleted',
  clients: 'id, nom, telephone, solde, updatedAt, deleted',
  dettes: 'id, clientId, montant, date, statut, venteId, updatedAt, deleted',
  depenses: 'id, libelle, montant, categorie, date, updatedAt, deleted',
  utilisateurs: 'id, nom, email, telephone, motDePasse, role, updatedAt, deleted',
  boutiques: 'id, nom, typeCommerce, devise, utilisateurId, updatedAt, deleted',
  categories: 'id, type, nom, icone, updatedAt, deleted',
  zakats: 'id, date, argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab, richesseSoumise, montantZakat, paye, updatedAt, deleted',
  notifications: 'id, type, titre, message, date, lue, referenceId, updatedAt, deleted',
  inventaires: 'id, date, statut, updatedAt, deleted',
  inventaireLignes: 'id, inventaireId, produitId, updatedAt, deleted',
});

