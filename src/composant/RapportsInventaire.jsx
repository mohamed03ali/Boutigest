import { useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { useInventaires, useInventaireDetail } from '../services/useInventaires';
import { useCurrency } from '../context/useCurrency';

export default function RapportInventaire({ onNouvelInventaire }) {
  const { inventaires } = useInventaires();
  const [inventaireOuvert, setInventaireOuvert] = useState(null);

  if (inventaireOuvert) {
    return <DetailInventaire inventaireId={inventaireOuvert} onRetour={() => setInventaireOuvert(null)} />;
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Inventaires</h1>
        <button onClick={onNouvelInventaire} className="rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium">
          Nouvel inventaire
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {(inventaires || []).length === 0 && (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucun inventaire encore réalisé.</p>
        )}
        {(inventaires || []).map((inv) => (
          <button key={inv.id} onClick={() => setInventaireOuvert(inv.id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                <Package size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Inventaire {inv.type === 'complet' ? 'complet' : 'partiel'}</p>
                <p className="text-xs text-gray-400">{new Date(inv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${inv.statut === 'valide' ? 'bg-good-100 text-good-600' : 'bg-gray-100 text-gray-500'}`}>
              {inv.statut === 'valide' ? 'Validé' : 'En cours'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailInventaire({ inventaireId, onRetour }) {
  const { formatMontant } = useCurrency();
  const detail = useInventaireDetail(inventaireId);

  if (!detail) return <p className="text-center text-sm text-gray-400 py-8">Chargement...</p>;

  const { lignes, conformes, ecartsPositifs, ecartsNegatifs, valeurTheorique, valeurReelle, ecartValeur, topPertes } = detail;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onRetour} className="text-gray-400"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-semibold text-gray-900">Rapport d'inventaire</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">Produits contrôlés</p>
          <p className="text-lg font-semibold text-gray-900">{lignes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">Conformes</p>
          <p className="text-lg font-semibold text-good-600">{conformes}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">Écarts positifs</p>
          <p className="text-lg font-semibold text-good-600">+{ecartsPositifs}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">Écarts négatifs</p>
          <p className="text-lg font-semibold text-alert-600">-{ecartsNegatifs}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Valeur théorique</span>
          <span className="text-gray-900 font-medium">{formatMontant(valeurTheorique)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Valeur réelle</span>
          <span className="text-gray-900 font-medium">{formatMontant(valeurReelle)}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-700 font-medium">Écart de valeur</span>
          <span className={`font-semibold ${ecartValeur < 0 ? 'text-alert-600' : 'text-good-600'}`}>
            {ecartValeur > 0 ? '+' : ''}{formatMontant(ecartValeur)}
          </span>
        </div>
      </div>

      {topPertes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top des pertes</h3>
          <div className="space-y-2">
            {topPertes.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{i + 1}. {l.nomProduit}</span>
                <span className="text-alert-600 font-medium">{l.ecart}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {lignes.map((l) => (
          <div key={l.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm text-gray-900">{l.nomProduit}</p>
              {l.motif && <p className="text-xs text-gray-400">{l.motif}</p>}
            </div>
            <div className="text-right text-sm">
              <span className="text-gray-400">{l.stockTheorique} → </span>
              <span className="text-gray-900 font-medium">{l.stockReel}</span>
              <span className={`ml-2 font-medium ${l.ecart > 0 ? 'text-good-600' : l.ecart < 0 ? 'text-alert-600' : 'text-gray-400'}`}>
                ({l.ecart > 0 ? '+' : ''}{l.ecart})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}