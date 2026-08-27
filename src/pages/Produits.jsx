import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import FormulaireProduit from '../composant/FormulaireProduit';

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

export default function Produits() {
  const { produits, ajouterProduit, modifierProduit, supprimerProduit } = useProduits();
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [produitEnEdition, setProduitEnEdition] = useState(null);

  /*const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );*/

// Produits.jsx — ajoute cet état
const [filtreCategorie, setFiltreCategorie] = useState('Toutes');
const [filtreOuvert, setFiltreOuvert] = useState(false);

const CATEGORIES = ['Toutes', 'Épicerie', 'Boissons', 'Hygiène', 'Vêtements', 'Autre'];

const produitsFiltres = produits.filter((p) => {
  const matchNom = p.nom.toLowerCase().includes(recherche.toLowerCase());
  const matchCategorie = filtreCategorie === 'Toutes' || p.categorie === filtreCategorie;
  return matchNom && matchCategorie;
});


  function ouvrirAjout() {
    setProduitEnEdition(null);
    setModalOuvert(true);
  }

  function ouvrirEdition(produit) {
    setProduitEnEdition(produit);
    setModalOuvert(true);
  }

  async function handleEnregistrer(donnees) {
    if (produitEnEdition) {
      await modifierProduit(produitEnEdition.id, donnees);
    } else {
      await ajouterProduit(donnees);
    }
    setModalOuvert(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Produits</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
  <button
    onClick={() => setFiltreOuvert((v) => !v)}
    className="p-2 text-gray-400 hover:text-gray-600"
  >
    <Filter size={18} />
  </button>
  {filtreOuvert && (
    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-40">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => { setFiltreCategorie(c); setFiltreOuvert(false); }}
          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
            filtreCategorie === c ? 'text-brand-600 font-medium' : 'text-gray-700'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )}
</div>

          <button
            onClick={ouvrirAjout}
            className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {produitsFiltres.map((p) => (
          <button
            key={p.id}
            onClick={() => ouvrirEdition(p)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{p.nom}</p>
              <p className="text-xs text-gray-500">Catégorie: {p.categorie} · Stock: {p.stock}</p>
            </div>
            <span className="text-sm font-medium text-gray-900">{formatCFA(p.prixVente)}</span>
          </button>
        ))}
        {produitsFiltres.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucun produit trouvé.</p>
        )}
      </div>

      {modalOuvert && (
        <FormulaireProduit
          produit={produitEnEdition}
          onEnregistrer={handleEnregistrer}
          onSupprimer={produitEnEdition ? () => { supprimerProduit(produitEnEdition.id); setModalOuvert(false); } : null}
          onFermer={() => setModalOuvert(false)}
        />
      )}
    </div>
  );
}
