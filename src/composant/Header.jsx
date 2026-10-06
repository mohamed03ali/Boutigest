import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../services/useNotifications';
import { useAuth } from '../services/useAuth';
import ConfirmModal from './ui/ConfirmModal';
import { useBoutique } from '../services/useBoutique';
export default function Header({ nomUtilisateur}) {
  const { nombreNonLues } = useNotifications();
  const { logout } = useAuth();
  const { boutique } = useBoutique();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [modalDeconnexionOuvert, setModalDeconnexionOuvert] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function fermerSiClicExterieur(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOuvert(false);
    }
    document.addEventListener('mousedown', fermerSiClicExterieur);
    return () => document.removeEventListener('mousedown', fermerSiClicExterieur);
  }, []);

  function confirmerDeconnexion() {
    logout();
    navigate('/connexion');
  }

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Bonjour, {nomUtilisateur} 👋</h1>
        <p className="text-sm text-gray-500">Voici un aperçu de votre activité aujourd'hui.</p>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/notifications" className="relative">
          <Bell size={20} className="text-gray-400" />
          {nombreNonLues > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-alert-600 rounded-full" />}
        </Link>

        <div className="relative" ref={menuRef}>
         <button onClick={() => setMenuOuvert((v) => !v)} className="w-9 h-9 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center">
        {boutique?.photoBoutique ? (
          <img src={boutique.photoBoutique} alt={boutique.nom} className="w-full h-full object-cover" />
        ) : (
          <span className="text-brand-600 font-medium text-sm">
            {boutique?.nom?.charAt(0).toUpperCase() || 'B'}
          </span>
        )}
      </button>
          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-[var(--shadow-card)] py-1 z-20">
              <button
                onClick={() => { setModalDeconnexionOuvert(true); setMenuOuvert(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-alert-600 hover:bg-gray-50 text-left"
              >
                <LogOut size={16} /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>

      {modalDeconnexionOuvert && (
        <ConfirmModal
          titre="Se déconnecter ?"
          message="Vous pourrez vous reconnecter à tout moment avec vos identifiants."
          labelConfirmer="Se déconnecter"
          variant="danger"
          onConfirmer={confirmerDeconnexion}
          onAnnuler={() => setModalDeconnexionOuvert(false)}
        />
      )}
    </header>
  );
}