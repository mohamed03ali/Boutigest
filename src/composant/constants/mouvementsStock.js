export const TYPES_MOUVEMENT = {
  // Anciennes valeurs génériques, gardées pour l'historique existant
  entree: { label: 'Entrée', sens: 'entree' },
  sortie: { label: 'Sortie', sens: 'sortie' },

  // Entrées
  stock_initial: { label: 'Stock initial', sens: 'entree' },
  achat: { label: 'Achat', sens: 'entree' },
  retour_client: { label: 'Retour client', sens: 'entree' },
  ajustement_positif: { label: 'Ajustement positif', sens: 'entree' },
  transfert_entrant: { label: 'Transfert entrant', sens: 'entree' },

  // Sorties
  vente: { label: 'Vente', sens: 'sortie' },
  retour_fournisseur: { label: 'Retour fournisseur', sens: 'sortie' },
  casse: { label: 'Casse', sens: 'sortie' },
  perte: { label: 'Perte', sens: 'sortie' },
  vol: { label: 'Vol', sens: 'sortie' },
  ajustement_negatif: { label: 'Ajustement négatif', sens: 'sortie' },
  transfert_sortant: { label: 'Transfert sortant', sens: 'sortie' },
};

// Types que l'utilisateur peut créer à la main. "vente", "achat" et
// "stock_initial" sont exclus : ils sont générés automatiquement ailleurs
// (création de vente, réception d'achat, création de produit).
export const TYPES_MOUVEMENT_MANUELS = [
  'retour_client',
  'ajustement_positif',
  'transfert_entrant',
  'retour_fournisseur',
  'casse',
  'perte',
  'vol',
  'ajustement_negatif',
  'transfert_sortant',
];

export const TYPES_AVEC_MOTIF_OBLIGATOIRE = ['casse', 'perte', 'vol'];

export const MOTIFS_SUGGERES = [
  'Produit cassé',
  'Produit perdu',
  'Produit volé',
  'Erreur de saisie',
  'Autre',
];