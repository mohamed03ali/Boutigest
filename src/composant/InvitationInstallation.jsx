import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useInstallPrompt } from '../services/useInstallPrompt';

export default function InvitationInstallation() {
  const { estInstallable, estInstallee, installer } = useInstallPrompt();
  const [ignoree, setIgnoree] = useState(false);

  if (!estInstallable || estInstallee || ignoree) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-[var(--shadow-card-hover)] p-4 flex items-center gap-3 z-40">
      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
        <Download size={18} className="text-brand-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">Installer Boutigest</p>
        <p className="text-xs text-gray-500">Accès rapide, même hors ligne.</p>
      </div>
      <button onClick={installer} className="rounded-xl bg-brand-600 text-white text-sm font-medium px-3 py-2">
        Installer
      </button>
      <button onClick={() => setIgnoree(true)} className="text-gray-400">
        <X size={16} />
      </button>
    </div>
  );
}