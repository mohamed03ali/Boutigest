export const PERMISSIONS = {
  admin: ['dashboard', 'ventes', 'produits', 'stock', 'clients', 'dettes', 'depenses', 'benefices', 'zakat', 'rapports', 'utilisateurs', 'parametres', 'notifications'],
  gerant: ['dashboard', 'ventes', 'produits', 'stock', 'clients', 'dettes', 'depenses', 'benefices', 'zakat', 'rapports', 'utilisateurs', 'parametres', 'notifications'],
  gestionnaire: ['dashboard', 'ventes', 'produits', 'stock', 'clients', 'dettes', 'depenses', 'benefices', 'zakat', 'rapports', 'notifications'],
  vendeur: ['dashboard', 'ventes', 'produits', 'stock', 'clients', 'dettes', 'notifications'],
  caissier: ['dashboard', 'ventes', 'dettes', 'clients', 'notifications'],
};

export function aAcces(role, module) {
  return PERMISSIONS[role]?.includes(module) ?? false;
}