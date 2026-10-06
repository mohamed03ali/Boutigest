// src/pages/ConfigurationBoutique.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { getSyncToken } from '../services/syncAuth';


const API_URL = 'http://localhost:3000';
const TYPES_COMMERCE = ['Épicerie', 'Boutique de vêtements', 'Quincaillerie', 'Pharmacie', 'Autre'];
const DEVISES = ['CFA - Franc CFA', 'EUR - Euro', 'USD - Dollar'];

export default function ConfigurationBoutique() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: 'Ma Boutique',
    typeCommerce: 'Épicerie',
    devise: 'CFA - Franc CFA',
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const token = getSyncToken();
      const maintenant = new Date().toISOString();
      let idBoutique;

      if (navigator.onLine && token) {
        const reponse = await fetch(`${API_URL}/boutiques`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        if (reponse.ok) {
          const donnees = await reponse.json();
          idBoutique = donnees.id; // même id des deux côtés, comme pour le compte
        }
      }

      // Si le serveur n'a pas répondu (hors ligne, ou token absent), on garde un id local
      if (!idBoutique) idBoutique = crypto.randomUUID();

      // ConfigurationBoutique.jsx — dans handleSubmit, après avoir déterminé idBoutique
await db.boutiques.add({
  id: idBoutique,
  ...form,
  updatedAt: maintenant,
  deleted: false,
});

// on enregistre le lien boutique ↔ utilisateur sur l'utilisateur, pas sur la boutique
await db.utilisateurs.update(user.id, { boutiqueId: idBoutique, updatedAt: maintenant });

const utilisateurMisAJour = { ...user, boutiqueId: idBoutique };
localStorage.setItem('currentUser', JSON.stringify(utilisateurMisAJour));



      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErreur('Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 text-2xl">
          🏪
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Configuration de votre boutique</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Informations de votre commerce</p>

        {erreur && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4 text-left">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block">
            <span className="text-sm text-gray-700">Nom de la boutique</span>
            <input
              name="nom" value={form.nom} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Type de commerce</span>
            <select
              name="typeCommerce"
              value={form.typeCommerce}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {TYPES_COMMERCE.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Devise</span>
            <select
              name="devise" value={form.devise} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {DEVISES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {chargement ? 'Enregistrement...' : 'Enregistrer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}