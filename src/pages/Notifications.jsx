import { useEffect } from 'react';
import { Boxes, Clock, RefreshCw } from 'lucide-react';
import { useNotifications } from '../services/useNotifications';

const ICONES = {
  stock_faible: { Icon: Boxes, color: 'text-warning-600 bg-orange-50' },
  dette_retard: { Icon: Clock, color: 'text-alert-600 bg-red-50' },
  sync: { Icon: RefreshCw, color: 'text-brand-600 bg-green-50' },
};

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

export default function Notifications() {
  const { notifications, marquerLue, verifierAlertes } = useNotifications();

  useEffect(() => {
    verifierAlertes();
  }, [verifierAlertes]);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Notifications</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.map((n) => {
          const { Icon, color } = ICONES[n.type] || ICONES.stock_faible;
          return (
            <button
              key={n.id}
              onClick={() => marquerLue(n.id)}
              className={`w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-gray-50 ${
                !n.lue ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{n.titre}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{tempsEcoule(n.date)}</p>
              </div>
              {!n.lue && <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 flex-none" />}
            </button>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucune notification.</p>
        )}
      </div>
    </div>
  );
}

