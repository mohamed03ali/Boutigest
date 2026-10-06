import { useState } from 'react';
import { PieChart, Pie, Cell,Tooltip, ResponsiveContainer } from 'recharts';
import { useRapports } from '../services/useRapports';
import { useCurrency } from '../context/useCurrency';
import { genererFacturePDF } from '../services/factureService';
import { FileDown } from 'lucide-react';
import { useBoutique } from '../services/useBoutique';
import { db } from '../db/db';
const COULEURS = ['#16794f', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444'];

/*function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}*/

export default function Rapports() {
   const { formatMontant } = useCurrency();
    const { boutique } = useBoutique();
  const {
    totalVentes, totalDepenses, beneficeBrut, beneficeNet,
    repartitionParCategorie, ventesPeriode, depensesPeriode, recalculer,
  } = useRapports();
  const [onglet, setOnglet] = useState('resume');
  const [periode, setPeriode] = useState('mois');

  function changerPeriode(p) {
    setPeriode(p);
    recalculer(p);
  }
  async function telechargerRecu(vente) {
    const lignes = await db.venteLignes.where('venteId').equals(vente.id).toArray();
    const client = vente.clientId ? await db.clients.get(vente.clientId) : null;
    genererFacturePDF(vente, lignes, boutique, client);
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
            <p className="text-2xl font-bold text-brand-900">{formatMontant(beneficeNet)}</p>
            <div className="flex gap-4 mt-2 text-xs text-brand-900/70">
              <span>Total ventes: {formatMontant(totalVentes)}</span>
              <span>Total dépenses: {formatMontant(totalDepenses)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Bénéfice brut</p>
              <p className="text-lg font-semibold text-gray-900">{formatMontant(beneficeBrut)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Dépenses</p>
              <p className="text-lg font-semibold text-alert-600">-{formatMontant(totalDepenses)}</p>
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
                    <Tooltip formatter={(v) => formatMontant(v)} />
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
        <div className="divide-y divide-gray-100">
          {ventesPeriode.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucune vente sur cette période.</p>
          )}
          {ventesPeriode.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {v.nomClient || 'Vente comptoir'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{v.nombreArticles} article{v.nombreArticles > 1 ? 's' : ''}
                  {' · '}{v.modePaiement === 'credit' ? 'Crédit' : 'Cash'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">{formatMontant(v.total)}</span>
                <button onClick={() => telechargerRecu(v)} className="text-brand-600">
                  <FileDown size={16} />
                </button>
              </div>
            </div>
          ))}
        
      
</div>
      )}
      {onglet === 'depenses' && (
        <div className="divide-y divide-gray-100">
          {depensesPeriode.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucune dépense sur cette période.</p>
          )}
          {depensesPeriode.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{d.libelle}</p>
                <p className="text-xs text-gray-500">
                  {d.categorie} · {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className="text-sm font-medium text-alert-600">{formatMontant(d.montant)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  
    )}