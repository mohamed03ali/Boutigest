import { Bell } from 'lucide-react';

export default function Header({ nomUtilisateur }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Bonjour, {nomUtilisateur} 👋</h1>
        <p className="text-sm text-gray-500">Voici un aperçu de votre activité aujourd'hui.</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={20} className="text-gray-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-alert-600 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-medium text-brand-900">
          {nomUtilisateur?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}