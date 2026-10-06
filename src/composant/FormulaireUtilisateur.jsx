import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const ROLES = [
  { value: 'vendeur', label: 'Vendeur' },
  { value: 'caissier', label: 'Caissier' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
];

export default function FormulaireUtilisateur({ onEnregistrer, onFermer }) {
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', motDePasse: '', role: 'vendeur' });
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.nom || !form.telephone || !form.motDePasse) {
      setErreur('Nom, téléphone et mot de passe sont obligatoires.');
      return;
    }
    if (form.motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setChargement(true);
    try {
      await onEnregistrer(form);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Ajouter un utilisateur</h3>
          <button onClick={onFermer}><X size={18} className="text-gray-400" /></button>
        </div>

        {erreur && <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Nom</span>
            <input name="nom" value={form.nom} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Téléphone</span>
            <input name="telephone" value={form.telephone} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Email (optionnel)</span>
            <input name="email" value={form.email} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Rôle</span>
            <select name="role" value={form.role} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          <label className="block relative">
            <span className="text-sm text-gray-700">Mot de passe</span>
            <input
              type={afficherMdp ? 'text' : 'password'}
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setAfficherMdp((v) => !v)}
              className="absolute right-3 top-8 text-gray-400"
            >
              {afficherMdp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          <button type="submit" disabled={chargement}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2 disabled:opacity-50">
            {chargement ? 'Ajout...' : 'Ajouter l\'utilisateur'}
          </button>
        </form>
      </div>
    </div>
  );
}