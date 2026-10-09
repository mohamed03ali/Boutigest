import { useState } from 'react';
import { Search } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import MouvementsStock from './MouvementsStock';
import NouvelInventaire from '../composant/NouvelInventaire';
import RapportInventaire from '../composant/RapportInventaire';

export default function Stock() {
  const { produits } = useProduits();
  const [recherche, setRecherche] = useState('');
  const [onglet, setOnglet] = useState('apercu');
  const [vueInventaire, setVueInventaire] = useState('liste'); // 'liste' | 'nouveau'

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const stockFaible = produits.filter((p) => p.stock > 0 && p.stock <= (p.seuilReappro || 10));
  const rupture = produits.filter((p) => p.stock <= 0);
  const quantiteTotaleStock = produits.reduce((total, p) => total + (Number(p.stock) || 0), 0);

  function statutProduit(p) {
    if (p.stock <= 0) return { label: 'Rupture', className: 'bg-red-50 text-alert-600' };
    if (p.stock <= (p.seuilReappro || 10)) return { label: 'Stock faible', className: 'bg-orange-50 text-warning-600' };
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Stock</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-brand-50 rounded-lg px-4 py-3">
            <p className="text-xs text-brand-600 font-medium">Quantité totale en stock</p>
            <p className="text-lg font-semibold text-gray-900">{quantiteTotaleStock} unités</p>
          </div>
          <div className="bg-orange-50 rounded-lg px-4 py-3">
            <p className="text-xs text-warning-600 font-medium">Stock faible</p>
            <p className="text-lg font-semibold text-gray-900">{stockFaible.length} produits</p>
          </div>
          <div className="bg-red-50 rounded-lg px-4 py-3">
            <p className="text-xs text-alert-600 font-medium">Rupture de stock</p>
            <p className="text-lg font-semibold text-gray-900">{rupture.length} produits</p>
          </div>
        </div>

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

      <div className="flex border-b border-gray-100 px-5">
        {['apercu', 'mouvements', 'inventaire'].map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              onglet === o ? 'border-brand-600 text-brand-600 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {o === 'apercu' ? 'Aperçu' : o === 'mouvements' ? 'Mouvements' : 'Inventaire'}
          </button>
        ))}
      </div>

      {onglet === 'apercu' && (
        <div className="divide-y divide-gray-100">
          {produitsFiltres.map((p) => {
            const statut = statutProduit(p);
            return (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nom}</p>
                  <p className="text-xs text-gray-500">Stock actuel: {p.stock}</p>
                </div>
                {statut && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statut.className}`}>
                    {statut.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {onglet === 'mouvements' && <MouvementsStock />}

      {onglet === 'inventaire' && (
        vueInventaire === 'nouveau' ? (
          <NouvelInventaire onTermine={() => setVueInventaire('liste')} />
        ) : (
          <RapportInventaire onNouvelInventaire={() => setVueInventaire('nouveau')} />
        )
      )}
    </div>
  );
}