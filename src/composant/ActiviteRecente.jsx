import { ShoppingCart, Package, Users } from 'lucide-react';

const ICONES = {
  vente: { Icon: ShoppingCart, color: 'text-brand-600 bg-brand-100' },
  stock: { Icon: Package, color: 'text-blue-600 bg-blue-50' },
  dette: { Icon: Users, color: 'text-orange-600 bg-orange-50' },
};

function tempsEcoule(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "à l'instant";
  if (minutes === 1) return "il y a 1 minute";
  if (minutes < 60) return `il y a ${minutes} minutes`;

  const heures = Math.floor(minutes/60)
  if (heures === 1) return "il y a 1 heure";
   if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
   if (jours === 1) return `il y a 1 jour`;
  return `il y a ${jours}jours`;
}

export default function ActiviteRecente({ activites }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Activité récente</h3>
      <div className="space-y-2">
        {activites.length === 0 && (
          <p className="text-sm text-gray-400">Aucune activité pour le moment.</p>
        )}
        {activites.map((a) => {
          const { Icon, color } = ICONES[a.type];
          return (
            <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={16} />
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
          );
        })}
      </div>
    </div>
  );
}
