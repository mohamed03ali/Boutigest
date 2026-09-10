import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useRapports } from '../services/useRapports';

const COULEURS = ['#16794f', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444'];

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

export default function Rapports() {
  const { totalVentes, totalDepenses, beneficeBrut, beneficeNet, repartitionParCategorie, recalculer } = useRapports();
  const [onglet, setOnglet] = useState('resume');
  const [periode, setPeriode] = useState('mois');

  function changerPeriode(p) {
    setPeriode(p);
    recalculer(p);
  }

  const donneesGraphique = repartitionParCategorie.map((c, i) => ({
    ...c, color: COULEURS[i % COULEURS.length],
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Rapports</h2>
        <select
  value={periode}
  onChange={(e) => changerPeriode(e.target.value)}
  className="text-sm border border-gray-200 rounded-lg px-2 py-1"
>
  <option value="jour">Aujourd'hui</option>
  <option value="semaine">Cette semaine</option>
  <option value="mois">Ce mois</option>
  <option value="tout">Depuis le début</option>
</select>
      </div>

      <div className="flex border-b border-gray-100 px-5">
        {[
          { key: 'resume', label: 'Résumé' },
          { key: 'ventes', label: 'Ventes' },
          { key: 'depenses', label: 'Dépenses' },
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

      {onglet === 'resume' && (
        <div className="p-5 space-y-4">
          <div className="bg-brand-100 rounded-xl p-4">
            <p className="text-xs text-brand-900 font-medium">Bénéfice net</p>
            <p className="text-2xl font-bold text-brand-900">{formatCFA(beneficeNet)}</p>
            <div className="flex gap-4 mt-2 text-xs text-brand-900/70">
              <span>Total ventes: {formatCFA(totalVentes)}</span>
              <span>Total dépenses: {formatCFA(totalDepenses)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Bénéfice brut</p>
              <p className="text-lg font-semibold text-gray-900">{formatCFA(beneficeBrut)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Dépenses</p>
              <p className="text-lg font-semibold text-alert-600">-{formatCFA(totalDepenses)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Répartition des ventes par catégorie</h3>
            {donneesGraphique.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune vente sur cette période.</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={donneesGraphique} dataKey="valeur" innerRadius={35} outerRadius={60}>
                      {donneesGraphique.map((entry) => <Cell key={entry.nom} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCFA(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {donneesGraphique.map((c) => (
                    <div key={c.nom} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      {c.nom} — {c.pourcentage}%
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {onglet === 'ventes' && (
        <p className="text-sm text-gray-400 text-center py-8 px-5">Détail des ventes — à affiner selon tes besoins.</p>
      )}
      {onglet === 'depenses' && (
        <p className="text-sm text-gray-400 text-center py-8 px-5">Détail des dépenses — à affiner selon tes besoins.</p>
      )}
    </div>
  );
}
