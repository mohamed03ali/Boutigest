import StatCard from '../composant/StatCard';
import ActiviteRecente from '../composant/ActiviteRecente';
import AlerteStockFaible from '../composant/AlerteStockFaible';
import { useDashboardStats } from '../services/useDashboardStats';
import { useDashboardActivite } from '../services/useDashboardActivite';

function formatCFA(valeur) {
  return new Intl.NumberFormat('fr-FR').format(valeur) + ' FCFA';
}

export default function Dashboard() {
  const stats = useDashboardStats();
  const { activites, produitsStockFaible } = useDashboardActivite();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ventes du jour" value={formatCFA(stats.venteDuJour)} trend="12% vs hier" trendUp accent="green" />
        <StatCard label="Bénéfice du mois" value={formatCFA(stats.beneficeDuMois)} trend="8% vs mois dernier" trendUp accent="blue" />
        <StatCard label="Produits en stock" value={stats.produitsEnStock} sublabel="Produits" accent="purple" />
        <StatCard label="Dettes clients" value={formatCFA(stats.dettesTotal)} sublabel={`${stats.nombreClientsDettes} clients`} accent="orange" />

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
