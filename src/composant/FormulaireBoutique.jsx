import { useState } from 'react';
import SelectCategorie from './SelectCategorie';

const DEVISES = ['CFA - Franc CFA', 'EUR - Euro', 'USD - Dollar'];

export default function FormulaireBoutique({ boutique, onEnregistrer }) {
  const [form, setForm] = useState({
    nom: boutique?.nom || '',
    typeCommerce: boutique?.typeCommerce || '',
    devise: boutique?.devise || DEVISES[0],
  });
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);
    try {
      await onEnregistrer(form);
      setMessage('Informations mises à jour.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setChargement(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-3">
      {message && <div className="bg-green-50 text-brand-600 text-sm rounded-lg px-3 py-2">{message}</div>}

      <label className="block">
        <span className="text-sm text-gray-700">Nom de la boutique</span>
        <input
          value={form.nom}
          onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Type de commerce</span>
        <SelectCategorie
          type="typeCommerce"
          valeur={form.typeCommerce}
          onChange={(t) => setForm((p) => ({ ...p, typeCommerce: t }))}
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Devise</span>
        <select
          value={form.devise}
          onChange={(e) => setForm((p) => ({ ...p, devise: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {DEVISES.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>

      {form.devise !== boutique?.devise && (
        <p className="text-xs text-warning-600">
          ⚠️ Changer la devise modifie uniquement l'affichage — les montants déjà enregistrés (ventes, dettes...) ne sont pas convertis automatiquement.
        </p>
      )}

      <button type="submit" disabled={chargement}
        className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
        {chargement ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}