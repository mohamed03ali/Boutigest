import { useState } from 'react';
import { Search } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import { useVente } from '../services/useVente';

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

export default function Ventes() {
  const { produits } = useProduits();
  const { panier, ajouterAuPanier, changerQuantite, sousTotal, encaisser,alerte } = useVente();
  const [recherche, setRecherche] = useState('');
  const [remise, setRemise] = useState(0);
  const [enCours, setEnCours] = useState(false);

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );
  const total = sousTotal - remise;

  async function handleEncaisser() {
    setEnCours(true);
    try {
      await encaisser(remise);
      setRemise(0);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Colonne gauche : recherche produits */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Produits</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit (code, nom...)"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {produitsFiltres.map((p) => (
           
<button
  key={p.id}
  onClick={() => ajouterAuPanier(p)}
  disabled={p.stock <= 0}
  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left disabled:opacity-40 disabled:cursor-not-allowed"
>
  <div>
    <p className="text-sm text-gray-900">{p.nom}</p>
    <p className={`text-xs ${p.stock <= 0 ? 'text-alert-600 font-medium' : 'text-gray-500'}`}>
      {p.stock <= 0 ? 'Rupture de stock' : `Stock: ${p.stock}`}
    </p>
  </div>
  <span className="text-sm font-medium text-gray-900">{formatCFA(p.prixVente)}</span>
</button>

          ))}
        </div>
      </div>

      {/* Colonne droite : panier / encaissement */}
      
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
        <h2 className="font-semibold text-gray-900 mb-3">Nouvelle vente</h2>

             {alerte && (
                 <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-3">
                       {alerte}
                 </div>
                         )}

        <div className="flex-1 space-y-2 overflow-y-auto">

          {panier.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Panier vide — sélectionnez un produit.</p>
          )}
          {panier.map((l) => (
            <div key={l.produitId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm text-gray-900">{l.nom}</p>
                <p className="text-xs text-gray-500">Stock: —</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changerQuantite(l.produitId, -1)} className="w-6 h-6 rounded bg-gray-200 text-sm">−</button>
                <span className="text-sm w-4 text-center">{l.quantite}</span>
                <button onClick={() => changerQuantite(l.produitId, 1)} className="w-6 h-6 rounded bg-gray-200 text-sm">+</button>
                <span className="text-sm font-medium w-20 text-right">{formatCFA(l.prixVente * l.quantite)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span><span>{formatCFA(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span>Remise</span>
            <input
              type="number" value={remise} onChange={(e) => setRemise(Number(e.target.value) || 0)}
              className="w-24 text-right border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-1">
            <span>Total</span><span>{formatCFA(total)}</span>
          </div>
        </div>

        <button
          onClick={handleEncaisser}
          disabled={panier.length === 0 || enCours}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-3 disabled:opacity-50"
        >
          {enCours ? 'Encaissement...' : 'Encaisser'}
        </button>
      </div>
    </div>
  );
}
