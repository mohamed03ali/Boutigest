import { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { db } from '../db/db';
import { useProduits } from '../services/useProduits';
import ConfirmModal from './ui/ConfirmModal';

const CATEGORIES_PAR_DEFAUT = ['Alimentation', 'Boissons', 'Hygiène', 'Téléphonie', 'Divers'];

export default function ModalProduit({ produit, onFermer }) {
  const estModification = Boolean(produit);
  const { ajouterProduit, modifierProduit, supprimerProduit } = useProduits();

  const [form, setForm] = useState({
    nom: '', categorie: CATEGORIES_PAR_DEFAUT[0],
    prixAchat: '', prixVente: '', stock: '', seuilReappro: '5', sku: '',
  });
  const [categories, setCategories] = useState(CATEGORIES_PAR_DEFAUT);
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false); // empêche le double-clic / double-soumission
  const [confirmSuppression, setConfirmSuppression] = useState(false);

  useEffect(() => {
    db.categories.filter((c) => !c.deleted).toArray().then((liste) => {
      setCategories([...CATEGORIES_PAR_DEFAUT, ...liste.map((c) => c.nom)]);
    });

    if (produit) {
      setForm({
        nom: produit.nom,
        categorie: produit.categorie,
        prixAchat: String(produit.prixAchat),
        prixVente: String(produit.prixVente),
        stock: String(produit.stock),
        seuilReappro: String(produit.seuilReappro),
        sku: produit.sku || '',
      });
    }
  }, [produit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAjouterCategorie() {
    const nom = nouvelleCategorie.trim();
    if (!nom) return;
    await db.categories.add({ id: crypto.randomUUID(), nom, updatedAt: new Date().toISOString(), deleted: false });
    setCategories((c) => [...c, nom]);
    setForm((f) => ({ ...f, categorie: nom }));
    setNouvelleCategorie('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (enCours) return; // garde-fou : un clic pendant que la requête précédente tourne encore ne fait rien

    setErreur('');
    if (!form.nom.trim()) { setErreur('Le nom du produit est obligatoire.'); return; }
    if (Number(form.prixVente) <= 0) { setErreur('Le prix de vente doit être supérieur à zéro.'); return; }

    setEnCours(true);
    try {
      const donnees = {
        nom: form.nom.trim(),
        categorie: form.categorie,
        prixAchat: Number(form.prixAchat) || 0,
        prixVente: Number(form.prixVente),
        stock: Number(form.stock) || 0,
        seuilReappro: Number(form.seuilReappro) || 0,
        sku: form.sku.trim(),
      };

      if (estModification) {
        await modifierProduit(produit.id, donnees);
      } else {
        await ajouterProduit(donnees);
      }
      onFermer(); // ferme le popup seulement après succès — c'est ça qui manquait
    } catch (err) {
      setErreur("Une erreur est survenue, le produit n'a pas été enregistré.",err);
    } finally {
      setEnCours(false);
    }
  }

  async function confirmerSuppression() {
    setConfirmSuppression(false);
    await supprimerProduit(produit.id);
    onFermer();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-full overflow-y-auto shadow-[var(--shadow-card-hover)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{estModification ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erreur && <div className="text-sm text-alert-600 bg-red-50 rounded-xl px-3 py-2">{erreur}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <input name="nom" value={form.nom} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select name="categorie" value={form.categorie} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <input value={nouvelleCategorie} onChange={(e) => setNouvelleCategorie(e.target.value)} placeholder="Ajouter une catégorie..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              <button type="button" onClick={handleAjouterCategorie} className="rounded-xl bg-brand-100 text-brand-600 px-3 text-sm font-medium">Ajouter</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat</label>
              <input type="number" name="prixAchat" value={form.prixAchat} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente</label>
              <input type="number" name="prixVente" value={form.prixVente} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de réapprovisionnement</label>
              <input type="number" name="seuilReappro" value={form.seuilReappro} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU (optionnel)</label>
            <input name="sku" value={form.sku} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>

          <button type="submit" disabled={enCours} className="w-full rounded-xl bg-brand-600 text-white py-2.5 text-sm font-medium disabled:opacity-60">
            {enCours ? 'Enregistrement...' : estModification ? 'Enregistrer les modifications' : 'Créer le produit'}
          </button>

          {estModification && (
            <button type="button" onClick={() => setConfirmSuppression(true)} className="w-full flex items-center justify-center gap-2 text-alert-600 text-sm font-medium py-2">
              <Trash2 size={16} /> Supprimer le produit
            </button>
          )}
        </form>
      </div>

      {confirmSuppression && (
        <ConfirmModal
          titre="Supprimer ce produit ?"
          message={`"${form.nom}" sera retiré du catalogue. Cette action sera synchronisée sur tous les appareils.`}
          labelConfirmer="Supprimer"
          variant="danger"
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setConfirmSuppression(false)}
        />
      )}
    </div>
  );
}