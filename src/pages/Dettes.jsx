
import { useState } from 'react';
import { useDettes } from '../services/useDettes';

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

export default function Dettes() {
  const { dettes, reglerDette } = useDettes();
  const [onglet, setOnglet] = useState('toutes');

  const dettesFiltrees = dettes.filter((d) => {
    if (onglet === 'retard') return d.statut === 'retard';
    if (onglet === 'reglees') return d.statut === 'reglee';
    return true;
  });

  const totalARecevoir = dettes.filter((d) => d.statut !== 'reglee').reduce((sum, d) => sum + d.montant, 0);
  const nombreClientsDebiteurs = new Set(dettes.filter((d) => d.statut !== 'reglee').map((d) => d.clientId)).size;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Dettes clients</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 rounded-lg px-4 py-3">
            <p className="text-xs text-alert-600 font-medium">Total à recevoir</p>
            <p className="text-lg font-semibold text-gray-900">{formatCFA(totalARecevoir)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg px-4 py-3">
            <p className="text-xs text-warning-600 font-medium">Clients débiteurs</p>
            <p className="text-lg font-semibold text-gray-900">{nombreClientsDebiteurs}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 px-5">
        {[
          { key: 'toutes', label: 'Toutes' },
          { key: 'retard', label: 'En retard' },
          { key: 'reglees', label: 'Réglées' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setOnglet(t.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              onglet === t.key ? 'border-brand-600 text-brand-600 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {dettesFiltrees.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.nomClient}</p>
              <p className="text-xs text-gray-500">{d.telephoneClient}</p>
              <p className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${d.statut === 'retard' ? 'text-alert-600' : 'text-gray-400'}`}>
                {formatCFA(d.montant)}
              </span>
              {d.statut === 'retard' ? (
                <button
                  onClick={() => reglerDette(d.id)}
                  className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg"
                >
                  Marquer réglée
                </button>
              ) : (
                <span className="text-xs bg-green-50 text-brand-600 px-2 py-1 rounded-full">Réglée</span>
              )}
            </div>
          </div>
        ))}
        {dettesFiltrees.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucune dette dans cette catégorie.</p>
        )}
      </div>
    </div>
  );
}

