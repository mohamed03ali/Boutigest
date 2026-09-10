
/*import { useState } from 'react';
import { X } from 'lucide-react';
import SelectCategorie from './SelectCategorie';

const CATEGORIES = ['Achat marchandises', 'Transport', 'Loyer', 'Électricité', 'Divers'];

export default function FormulaireDepense({ onEnregistrer, onFermer }) {
  const [form, setForm] = useState({ libelle: '', montant: '', categorie: CATEGORIES[0] });
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.libelle || !form.montant) {
      setErreur('Libellé et montant sont obligatoires.');
      return;
    }
    onEnregistrer({ ...form, montant: Number(form.montant) });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Nouvelle dépense</h3>
          <button onClick={onFermer}><X size={18} className="text-gray-400" /></button>
        </div>

        {erreur && <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Libellé</span>
            <input name="libelle" value={form.libelle} onChange={handleChange}
              placeholder="Ex: Achat marchandises"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
  <span className="text-sm text-gray-700">Catégorie</span>
  <SelectCategorie
    type="depense"
    valeur={form.categorie}
    onChange={(cat) => setForm((prev) => ({ ...prev, categorie: cat }))}
  />
</label>


          <label className="block">
            <span className="text-sm text-gray-700">Montant</span>
            <input type="number" name="montant" value={form.montant} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <button type="submit" className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}*/
import { useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Achat marchandises', 'Transport', 'Loyer', 'Électricité', 'Divers'];

export default function FormulaireDepense({ onEnregistrer, onFermer }) {
  const [form, setForm] = useState({ libelle: '', montant: '', categorie: CATEGORIES[0] });
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.libelle || !form.montant) {
      setErreur('Libellé et montant sont obligatoires.');
      return;
    }
    onEnregistrer({ ...form, montant: Number(form.montant) });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Nouvelle dépense</h3>
          <button onClick={onFermer}><X size={18} className="text-gray-400" /></button>
        </div>

        {erreur && <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Libellé</span>
            <input name="libelle" value={form.libelle} onChange={handleChange}
              placeholder="Ex: Achat marchandises"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Catégorie</span>
            <select name="categorie" value={form.categorie} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Montant</span>
            <input type="number" name="montant" value={form.montant} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <button type="submit" className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}

