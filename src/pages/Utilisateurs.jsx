import { useState } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';
import { useUtilisateurs } from '../services/useUtilisateurs';
import { useAuth } from '../services/useAuth';
import { getSyncToken } from '../services/syncAuth';
import ConfirmModal from '../composant/ui/ConfirmModal';

const API_URL = 'http://localhost:3000'; // on repasse sur VITE_API_URL au moment du déploiement

const ROLES = ['admin', 'gestionnaire', 'vendeur', 'caissier'];
const LIBELLES_ROLE = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  vendeur: 'Vendeur',
  caissier: 'Caissier',
};

export default function Utilisateurs() {
  const { user } = useAuth();
  const { utilisateurs, ajouterUtilisateur, supprimerUtilisateur } = useUtilisateurs();

  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', motDePasse: '', role: 'vendeur' });
  const [erreur, setErreur] = useState('');
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState(null);

  const estAdmin = user?.role === 'admin' || user?.role === 'gerant';

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    try {
      await ajouterUtilisateur(form);
      setForm({ nom: '', telephone: '', email: '', motDePasse: '', role: 'vendeur' });
      setAfficherFormulaire(false);
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function confirmerSuppression() {
    await supprimerUtilisateur(utilisateurASupprimer?.id);

    const token = getSyncToken();
    if (token && navigator.onLine) {
      fetch(`${API_URL}/utilisateurs/${utilisateurASupprimer?.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    setUtilisateurASupprimer(null);
  }
if (!user) {
  return null
}
  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Utilisateurs</h1>
        {estAdmin && (
          <button onClick={() => setAfficherFormulaire((v) => !v)} className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-medium">
            <Plus size={16} /> Inviter
          </button>
        )}
      </div>

      {afficherFormulaire && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-3">
          {erreur && <div className="text-sm text-alert-600 bg-red-50 rounded-xl px-3 py-2">{erreur}</div>}
          <input placeholder="Nom complet" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input placeholder="Email (optionnel)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input type="password" placeholder="Mot de passe" value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
            {ROLES.filter((r) => r !== 'admin').map((r) => <option key={r} value={r}>{LIBELLES_ROLE[r]}</option>)}
          </select>
          <button type="submit" className="w-full rounded-xl bg-brand-600 text-white py-2.5 text-sm font-medium">Créer le compte</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] divide-y divide-gray-100">
        {utilisateurs.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium text-sm">
                {u.nom?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{u.nom}</p>
                <p className="text-xs text-gray-400">{u.email || u.telephone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Shield size={12} /> {LIBELLES_ROLE[u.role] || u.role}
              </span>
              {estAdmin && u.id !== user.id && (
                <button onClick={() => setUtilisateurASupprimer(u)} className="text-gray-400 hover:text-alert-600">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {utilisateurASupprimer && (
        <ConfirmModal
          titre="Retirer cet utilisateur ?"
          message={`${utilisateurASupprimer.nom} n'aura plus accès à la boutique.`}
          labelConfirmer="Retirer"
          variant="danger"
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setUtilisateurASupprimer(null)}
        />
      )}
    </div>
  );
}