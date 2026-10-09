import { useState } from 'react';
import { Plus, Trash2, Banknote, Home, Zap, Droplet, Truck, Wrench, Package, Landmark, Smartphone, Tag } from 'lucide-react';
import { db } from '../db/db';
import { useDepenses } from '../services/useDepenses';
import ConfirmModal from '../composant/ui/ConfirmModal';

const ICONES_CATEGORIE = {
  Salaire: Banknote,
  Loyer: Home,
  Électricité: Zap,
  Eau: Droplet,
  Transport: Truck,
  Réparation: Wrench,
  Fournitures: Package,
  'Impôts & taxes': Landmark,
  Communication: Smartphone,
  Autre: Tag,
};

export default function Depenses() {
  const { depenses, ajouterDepense, supprimerDepense, totalMois } = useDepenses();
  const [categories, setCategories] = useState(Object.keys(ICONES_CATEGORIE));
  const [form, setForm] = useState({ libelle: '', montant: '', categorie: 'Autre' });
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [depenseASupprimer, setDepenseASupprimer] = useState(null);

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
    if (!form.libelle.trim() || Number(form.montant) <= 0) return;

    await ajouterDepense({
      libelle: form.libelle.trim(),
      montant: Number(form.montant),
      categorie: form.categorie,
    });

    setForm({ libelle: '', montant: '', categorie: 'Autre' });
    setAfficherFormulaire(false);
  }

  async function confirmerSuppression() {
    await supprimerDepense(depenseASupprimer?.id);
    setDepenseASupprimer(null);
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dépenses</h1>
        <button onClick={() => setAfficherFormulaire((v) => !v)} className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-medium">
          <Plus size={16} /> Nouvelle
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-gray-500">Total du mois</p>
        <p className="text-2xl font-semibold text-gray-900">{totalMois.toLocaleString('fr-FR')} FCFA</p>
      </div>

      {afficherFormulaire && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-3">
          <input placeholder="Description" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input type="number" placeholder="Montant (FCFA)" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={nouvelleCategorie} onChange={(e) => setNouvelleCategorie(e.target.value)} placeholder="Ajouter une catégorie..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            <button type="button" onClick={handleAjouterCategorie} className="rounded-xl bg-brand-100 text-brand-600 px-3 text-sm font-medium">Ajouter</button>
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-600 text-white py-2.5 text-sm font-medium">Enregistrer</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] divide-y divide-gray-100">
        {depenses.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune dépense enregistrée.</p>}
        {depenses.map((d) => {
          const Icone = ICONES_CATEGORIE[d.categorie] || Tag;
          return (
            <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Icone size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.libelle}</p>
                  <p className="text-xs text-gray-400">{d.categorie}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{d.montant.toLocaleString('fr-FR')} FCFA</span>
                <button onClick={() => setDepenseASupprimer(d)} className="text-gray-400 hover:text-alert-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {depenseASupprimer && (
        <ConfirmModal
          titre="Supprimer cette dépense ?"
          message={`"${depenseASupprimer.libelle}" (${depenseASupprimer.montant.toLocaleString('fr-FR')} FCFA) sera supprimée.`}
          labelConfirmer="Supprimer"
          variant="danger"
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setDepenseASupprimer(null)}
        />
      )}
    </div>
  );
}