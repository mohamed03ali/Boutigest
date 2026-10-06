import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ titre, message, labelConfirmer = 'Confirmer', variant = 'danger', onConfirmer, onAnnuler }) {
  const couleurs = {
    danger: { bg: 'bg-red-50', icon: 'text-alert-600', bouton: 'bg-alert-600 hover:bg-red-700' },
    brand: { bg: 'bg-brand-100', icon: 'text-brand-600', bouton: 'bg-brand-600 hover:bg-brand-900' },
  };
  const c = couleurs[variant];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-[var(--shadow-card-hover)]">
        <div className={`w-12 h-12 mx-auto rounded-full ${c.bg} flex items-center justify-center mb-4`}>
          <AlertTriangle size={22} className={c.icon} />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{titre}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onAnnuler}
            className="flex-1 rounded-xl border border-gray-200 text-gray-700 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmer}
            className={`flex-1 rounded-xl text-white py-2.5 text-sm font-medium transition-colors ${c.bouton}`}
          >
            {labelConfirmer}
          </button>
        </div>
      </div>
    </div>
  );
}