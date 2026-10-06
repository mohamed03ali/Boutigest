import { useZakat } from '../services/useZakat';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCurrency } from '../context/useCurrency';

/*function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' FCFA';
}*/

export default function HistoriqueZakat() {
  const { formatMontant } = useCurrency();
  const { historique, marquerPaye } = useZakat();

  return (
    <div className="bg-white rounded-xl shadow-sm">
     <div className="flex items-center gap-2 p-5 border-b border-gray-100">
  <Link to="/zakat"><ArrowLeft size={18} className="text-gray-400" /></Link>
  <h2 className="font-semibold text-gray-900">Historique des zakats</h2>
</div>

      <div className="divide-y divide-gray-100">
        {historique.map((z) => (
          <div key={z.id} className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">
                {new Date(z.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {z.paye ? (
                <span className="text-xs bg-green-50 text-brand-600 px-2 py-1 rounded-full">Zakat payé</span>
              ) : (
                <button
                  onClick={() => marquerPaye(z.id)}
                  className="text-xs bg-orange-50 text-warning-600 px-2 py-1 rounded-full hover:bg-orange-100"
                >
                  Non payé — marquer payé
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">Richesse soumise: {formatMontant(z.richesseSoumise)}</p>
            <p className="text-xs text-gray-500">Zakat dû: {formatMontant(z.montantZakat)}</p>
          </div>
        ))}
        {historique.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucun calcul enregistré.</p>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full text-brand-600 text-sm font-medium py-2">
          Exporter l'historique
        </button>
      </div>
    </div>
  );
}