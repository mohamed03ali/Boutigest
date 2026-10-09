// src/components/SelecteurBoutique.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Store } from 'lucide-react';
import { db } from '../db/db';
import { useAuth } from '../services/useAuth';
import { getSyncToken } from '../services/syncAuth';

const API_URL = 'http://localhost:3000';

export default function SelecteurBoutique() {
  const { user, ouvrirSession } = useAuth();
  const navigate = useNavigate();
  const [boutiques, setBoutiques] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let actif = true;
    db.boutiques
      .where('utilisateurId').equals(user.id)
      .and((b) => !b.deleted)
      .toArray()
      .then((liste) => { if (actif) setBoutiques(liste); })
      .catch((err) => console.error('Erreur chargement boutiques:', err));

    return () => { actif = false; };
  }, [user?.id]);

  const boutiqueActive = boutiques.find((b) => b.id === user?.boutiqueId) || boutiques[0];

  async function choisirBoutique(boutique) {
    if (boutique.id === user.boutiqueId) {
      setOuvert(false);
      return;
    }

    setChargement(true);
    try {
      const maintenant = new Date().toISOString();
      await db.utilisateurs.update(user.id, { boutiqueId: boutique.id, updatedAt: maintenant });

      const utilisateurMisAJour = { ...user, boutiqueId: boutique.id };
      localStorage.setItem('currentUser', JSON.stringify(utilisateurMisAJour));
      ouvrirSession(utilisateurMisAJour);

      const token = getSyncToken();
      if (navigator.onLine && token) {
        fetch(`${API_URL}/boutiques/active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ boutiqueId: boutique.id }),
        }).catch((err) => console.error('Erreur synchro boutique active:', err));
      }
    } finally {
      setChargement(false);
      setOuvert(false);
    }
  }

  if (!boutiques.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        disabled={chargement}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 disabled:opacity-60"
      >
        <Store size={16} className="text-brand-600" />
        <span className="max-w-[140px] truncate">{boutiqueActive?.nom || 'Boutique'}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {ouvert && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
          <ul className="max-h-64 overflow-y-auto py-1">
            {boutiques.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => choisirBoutique(b)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    b.id === boutiqueActive?.id ? 'text-brand-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{b.nom}</span>
                  {b.id === boutiqueActive?.id && <span className="text-xs">●</span>}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigate('/configuration-boutique')}
            className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            <Plus size={16} />
            Ajouter une boutique
          </button>
        </div>
      )}
    </div>
  );
}