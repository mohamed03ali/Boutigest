

import { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import ModalProduit from '../composant/ModalProduit';

export default function Produits() {
  const { produits, chargement } = useProduits();
  const [recherche, setRecherche] = useState('');
  const [modalOuverte, setModalOuverte] = useState(false);
  const [produitSelectionne, setProduitSelectionne] = useState(null); // null = création

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(recherche.toLowerCase())
  );

  function ouvrirCreation() {
    setProduitSelectionne(null);
    setModalOuverte(true);
  }

  function ouvrirModification(produit) {
    setProduitSelectionne(produit);
    setModalOuverte(true);
  }

  function fermerModal() {
    setModalOuverte(false);
    setProduitSelectionne(null);
    // pas besoin de recharger manuellement : useProduits() se met déjà à jour
    // via son propre recharger() appelé à l'intérieur de ajouterProduit/modifierProduit/supprimerProduit
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Produits</h1>
        <button onClick={ouvrirCreation} className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-medium">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un produit (code, nom)..."
          className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] divide-y divide-gray-100">
        {chargement && <p className="px-5 py-8 text-sm text-gray-400 text-center">Chargement...</p>}
        {!chargement && produitsFiltres.length === 0 && (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucun produit trouvé.</p>
        )}
        {produitsFiltres.map((p) => (
          <button
            key={p.id}
            onClick={() => ouvrirModification(p)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                <Package size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nom}</p>
                <p className="text-xs text-gray-400">Stock : {p.stock}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">{p.prixVente.toLocaleString('fr-FR')} FCFA</span>
          </button>
        ))}
      </div>

      {modalOuverte && (
        <ModalProduit produit={produitSelectionne} onFermer={fermerModal} />
      )}
    </div>
  );
}
