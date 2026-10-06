import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { useActiviteComplete } from '../services/useActiviteComplete';

function tempsEcoule(date) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes === 1) return 'il y a 1 minute';
  if (minutes < 60) return `il y a ${minutes} minutes`;
  const heures = Math.floor(minutes / 60);
  if (heures === 1) return 'il y a 1 heure';
  if (heures < 24) return `il y a ${heures} heures`;
  const jours = Math.floor(heures / 24);
  return jours === 1 ? 'il y a 1 jour' : `il y a ${jours} jours`;
}

export default function ActiviteComplete() {
  const [filtre, setFiltre] = useState('toutes'); const { activitesFiltrees } = useActiviteComplete(filtre);
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center gap-2 p-5 border-b border-gray-100">
        <Link to="/dashboard"><ArrowLeft size={20} className="text-gray-400" /></Link>
        <h2 className="font-semibold text-gray-900">Toute l'activité</h2>
      </div>

      <div className="flex gap-2 px-5 pt-4">
        {[
          { key: 'toutes', label: 'Toutes' },
          { key: 'ventes', label: 'Ventes' },
          { key: 'stock', label: 'Stock' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filtre === f.key ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-100 mt-3">
        {activitesFiltrees.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                a.categorie === 'ventes' ? 'bg-brand-100 text-brand-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {a.categorie === 'ventes' ? <ShoppingCart size={16} /> : <Package size={16} />}
              </div>
              <div>
                <p className="text-sm text-gray-900">{a.titre}</p>
                <p className="text-xs text-gray-500">{a.sousTitre}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{a.montant}</p>
              <p className="text-xs text-gray-400">{tempsEcoule(a.date)}</p>
            </div>
          </div>
        ))}
        {activitesFiltrees.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucune activité dans cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
