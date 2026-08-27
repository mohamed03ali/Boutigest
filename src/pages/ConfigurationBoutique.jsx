import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';

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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      await db.boutiques.add({
        ...form,
        utilisateurId: user.id,
      });
      navigate('/connexion');
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

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block">
            <span className="text-sm text-gray-700">Nom de la boutique</span>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
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
              name="devise"
              value={form.devise}
              onChange={handleChange}
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


