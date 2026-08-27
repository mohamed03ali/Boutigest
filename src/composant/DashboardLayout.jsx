
import { Outlet } from 'react-router-dom';
import Header from "../composant/Header"
import Sidebar from "../composant/Sidebar"

/*
export default function DashboardLayout() {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header nomUtilisateur={user?.nom} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
*/
// DashboardLayout.jsx
import { useState } from 'react';
import { Menu} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  return (
    <div className="flex h-screen bg-surface">
      {/* Overlay mobile, ferme la sidebar au clic à côté */}
      {sidebarOuverte && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOuverte(false)}
        />
      )}

      {/* Sidebar : cachée par défaut sur mobile, visible en position fixe si ouverte, toujours visible dès md */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform
        ${sidebarOuverte ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
       
       {/* <div className='flex justify-end px-3 pt-3 md:hidden'>
          <button onClick={()=> setSidebarOuverte(false)}>
            <X size={20} className='text-white' />
          </button>
        </div>*/}
        <Sidebar onNaviguer={() => setSidebarOuverte(false)}
         />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 md:hidden">
          <button onClick={() => setSidebarOuverte(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Boutigest</span>
        </div>

        <Header nomUtilisateur={user?.nom} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
