import { Outlet } from 'react-router-dom';
import Header from "../composant/Header"
import Sidebar from "../composant/Sidebar"
import { useSyncAuto } from '../services/useSyncAuto';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import InvitationInstallation from './InvitationInstallation';
import { useAuth } from '../services/useAuth';

export default function DashboardLayout() {
  const { enCours } = useSyncAuto();
  const { user } = useAuth();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  return (
    <div className="flex h-screen bg-surface">
      {sidebarOuverte && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOuverte(false)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform
        ${sidebarOuverte ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <Sidebar onNaviguer={() => setSidebarOuverte(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 md:hidden">
          <button onClick={() => setSidebarOuverte(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Boutigest</span>
        </div>
        {enCours && (
          <div className="bg-blue-50 text-blue-700 text-xs px-4 py-1.5 flex items-center gap-2">
            <RefreshCw size={12} className="animate-spin" /> Synchronisation en cours...
          </div>
        )}

        <Header nomUtilisateur={user?.nom} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <InvitationInstallation />
    </div>
  );
}