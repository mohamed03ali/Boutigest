import { NavLink } from "react-router-dom";
import { usePermissions } from "../services/usePermissions";
import {LayoutDashboard,ShoppingCart,Package,Boxes,Users,Receipt,Wallet,Landmark,FileText,UsersRound,Settings,WifiOff} from 'lucide-react'


const MENU = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { to: '/ventes', label: 'Ventes', icon: ShoppingCart, module: 'ventes' },
  { to: '/produits', label: 'Produits', icon: Package, module: 'produits' },
  { to: '/stock', label: 'Stock', icon: Boxes, module: 'stock' },
  { to: '/clients', label: 'Clients', icon: Users, module: 'clients' },
  { to: '/dettes', label: 'Dettes', icon: Receipt, module: 'dettes' },
  { to: '/depenses', label: 'Dépenses', icon: Wallet, module: 'depenses' },
  { to: '/zakat', label: 'Zakat', icon: Landmark, module: 'zakat' },
  { to: '/rapports', label: 'Rapports', icon: FileText, module: 'rapports' },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: UsersRound, module: 'utilisateurs' },
  { to: '/parametres', label: 'Paramètres', icon: Settings, module: 'parametres' },
];

export default function Sidebar({ onNaviguer }) {
  const { peutAcceder } = usePermissions();
  const menuVisible = MENU.filter((item) => peutAcceder(item.module));
      
    return(
        <aside className="w-64 bg-brand-900 text-white flex flex-col h-screen">
            <div className="flex items-center gap-2 px-6 py-5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center"><ShoppingCart size={18} /></div>
                <span className="font-semibold tracking-wide">BOUTIGEST</span>
            </div>
                 
                    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuVisible.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNaviguer}  className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive?'bg-brand-600 ,text-white':'text-gray-300 hover:bg-white/10'}`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
                    <div className="px-3 py-4 border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-400 px-3">
                        <WifiOff size={14} />Mode hors ligne
                    </div>
                    </div>
                  
        </aside>

    )
    
}