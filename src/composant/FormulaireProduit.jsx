import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { useProduits } from '../services/useProduits';
import ConfirmModal from '../composant/ui/ConfirmModal';

const CATEGORIES_PAR_DEFAUT = ['Alimentation', 'Boissons', 'Hygiène', 'Téléphonie', 'Divers'];

export default function FormulaireProduit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const estModification = Boolean(id);
  const { produits, chargement, ajouterProduit, modifierProduit, supprimerProduit } = useProduits();

  const [form, setForm] = useState({
    nom: '', categorie: CATEGORIES_PAR_DEFAUT[0],
    prixAchat: '', prixVente: '', stock: '', seuilReappro: '5', sku: '',
  });
  const [categories, setCategories] = useState(CATEGORIES_PAR_DEFAUT);
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [erreur, setErreur] = useState('');
  const [confirmSuppression, setConfirmSuppression] = useState(false);

  useEffect(() => {
    db.categories.filter((c) => !c.deleted).toArray().then((liste) => {
      setCategories([...CATEGORIES_PAR_DEFAUT, ...liste.map((c) => c.nom)]);
    });
  }, []);

  // le produit arrive via le hook une fois `produits` chargé ; on remplit le formulaire quand on le trouve
  useEffect(() => {
    if (!estModification || chargement) return;
    const produit = produits.find((p) => p.id === id);
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
  }, [estModification, chargement, produits, id]);

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
    setErreur('');

    if (!form.nom.trim()) { setErreur('Le nom du produit est obligatoire.'); return; }
    if (Number(form.prixVente) <= 0) { setErreur('Le prix de vente doit être supérieur à zéro.'); return; }

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
      await modifierProduit(id, donnees);
    } else {
      await ajouterProduit(donnees);
    }
    navigate('/produits');
  }

  async function confirmerSuppression() {
    setConfirmSuppression(false);
    await supprimerProduit(id);
    navigate('/produits');
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {estModification ? 'Modifier le produit' : 'Nouveau produit'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4">
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
            <input type="number" name="quantite" value={form.stock} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
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

        <button type="submit" className="w-full rounded-xl bg-brand-600 text-white py-2.5 text-sm font-medium">
          {estModification ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>

        {estModification && (
          <button type="button" onClick={() => setConfirmSuppression(true)} className="w-full flex items-center justify-center gap-2 text-alert-600 text-sm font-medium py-2">
            <Trash2 size={16} /> Supprimer le produit
          </button>
        )}
      </form>

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