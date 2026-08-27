
import { useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Épicerie', 'Boissons', 'Hygiène', 'Vêtements', 'Autre'];

export default function FormulaireProduit({ produit, onEnregistrer, onSupprimer, onFermer }) {
  const [form, setForm] = useState({
    nom: produit?.nom || '',
    categorie: produit?.categorie || CATEGORIES[0],
    prixVente: produit?.prixVente || '',
    prixAchat: produit?.prixAchat || '',
    stock: produit?.stock ?? '',
    seuilReappro: produit?.seuilReappro || 10,
  });
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom || !form.prixVente || !form.prixAchat) {
      setErreur('Nom, prix de vente et prix d\'achat sont obligatoires.');
      return;
    }
    onEnregistrer({
      ...form,
      prixVente: Number(form.prixVente),
      prixAchat: Number(form.prixAchat),
      stock: Number(form.stock) || 0,
      seuilReappro: Number(form.seuilReappro),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {produit ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <button onClick={onFermer}><X size={18} className="text-gray-400" /></button>
        </div>

        {erreur && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">{erreur}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Nom du produit</span>
            <input
              name="nom" value={form.nom} onChange={handleChange}
              placeholder="Ex: Sucre 1kg"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Catégorie</span>
            <select
              name="categorie" value={form.categorie} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-700">Prix de vente</span>
              <input
                type="number" name="prixVente" value={form.prixVente} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Prix d'achat</span>
              <input
                type="number" name="prixAchat" value={form.prixAchat} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-700">Stock initial</span>
              <input
                type="number" name="stock" value={form.stock} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Seuil réappro.</span>
              <input
                type="number" name="seuilReappro" value={form.seuilReappro} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2"
          >
            {produit ? 'Enregistrer les modifications' : 'Enregistrer le produit'}
          </button>

          {onSupprimer && (
            <button
              type="button"
              onClick={onSupprimer}
              className="w-full text-alert-600 text-sm py-2"
            >
              Supprimer ce produit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
