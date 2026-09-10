import { useState } from 'react';
import StatCard from '../composant/StatCard';
import SelecteurPeriode from '../composant/SelecteurPeriode';
import ActiviteRecente from '../composant/ActiviteRecente';
import AlerteStockFaible from '../composant/AlerteStockFaible';
import { useDashboardStats } from '../services/useDashboardStats';
import { useDashboardActivite } from '../services/useDashboardActivite';

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

const LABELS_VENTES = {
  jour: 'Ventes du jour',
  semaine: 'Ventes de la semaine',
  mois: 'Ventes du mois',
  tout: 'Ventes (total)',
};

const LABELS_BENEFICE = {
  jour: 'Bénéfice du jour',
  semaine: 'Bénéfice de la semaine',
  mois: 'Bénéfice du mois',
  tout: 'Bénéfice (total)',
};

export default function Dashboard() {
  const [periode, setPeriode] = useState('jour');
  const stats = useDashboardStats(periode);
  const { activites, produitsStockFaible } = useDashboardActivite();

  return (
    <div className="space-y-4">
      <SelecteurPeriode valeur={periode} onChange={setPeriode} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={LABELS_VENTES[periode]} value={formatCFA(stats.ventes)} accent="green" />
        <StatCard label={LABELS_BENEFICE[periode]} value={formatCFA(stats.benefice)} accent="blue" />
        <StatCard label="Produits en stock" value={stats.produitsEnStock} accent="purple" />
        <StatCard label="Dettes clients" value={formatCFA(stats.dettesTotal)} accent="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ActiviteRecente activites={activites} />
        </div>
        <AlerteStockFaible produits={produitsStockFaible} />
      </div>
    </div>
  );
}