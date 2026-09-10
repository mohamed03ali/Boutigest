import { useState } from 'react';
import { X } from 'lucide-react';

export default function FormulaireClient({ client, onEnregistrer, onFermer }) {
  const [form, setForm] = useState({
    nom: client?.nom || '',
    telephone: client?.telephone || '',
  });
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom || !form.telephone) {
      setErreur('Nom et téléphone sont obligatoires.');
      return;
    }
    onEnregistrer(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h3>
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
          <button type="submit" className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2">
            {client ? 'Enregistrer les modifications' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}
