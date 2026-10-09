import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, X } from 'lucide-react';
import { db } from '../db/db';
import { useAuth } from '../services/useAuth';
import {
  TYPES_MOUVEMENT,
  TYPES_MOUVEMENT_MANUELS,
  TYPES_AVEC_MOTIF_OBLIGATOIRE,
  MOTIFS_SUGGERES,
} from '../composant/constants/mouvementsStock';
import { enregistrerMouvement } from '../services/mouvementsStockService';

const PERIODES = {
  tout: () => true,
  jour: (date) => estDansLesDerniersJours(date, 1),
  semaine: (date) => estDansLesDerniersJours(date, 7),
  mois: (date) => estDansLesDerniersJours(date, 30),
};

function estDansLesDerniersJours(dateIso, jours) {
  const diff = Date.now() - new Date(dateIso).getTime();
  return diff <= jours * 24 * 60 * 60 * 1000;
}

export default function MouvementsStock() {
  const { user } = useAuth();
  const [filtreProduit, setFiltreProduit] = useState('tous');
  const [filtreType, setFiltreType] = useState('tous');
  const [filtrePeriode, setFiltrePeriode] = useState('mois');
  const [modalOuvert, setModalOuvert] = useState(false);

  const produits = useLiveQuery(
    () => db.produits.toArray(),
    []
  ) || [];

  const mouvements = useLiveQuery(
    () => db.mouvementsStock
      .orderBy('date')
      .reverse()
      .filter((m) => !m.deleted)
      .toArray(),
    []
  ) || [];

  const mouvementsFiltres = useMemo(() => {
    return mouvements
      .filter((m) => filtreProduit === 'tous' || m.produitId === filtreProduit)
      .filter((m) => filtreType === 'tous' || m.type === filtreType)
      .filter((m) => PERIODES[filtrePeriode](m.date));
  }, [mouvements, filtreProduit, filtreType, filtrePeriode]);

  const mouvementsEnrichis = useMemo(() => {
    return mouvementsFiltres.map((m) => ({
      ...m,
      nomProduit: produits.find((p) => p.id === m.produitId)?.nom || 'Produit supprimé',
    }));
  }, [mouvementsFiltres, produits]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-4 border-b border-gray-100">
        <select
          value={filtreProduit}
          onChange={(e) => setFiltreProduit(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="tous">Tous les produits</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>

        <select
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="tous">Tous les types</option>
          <optgroup label="Entrées">
            {Object.entries(TYPES_MOUVEMENT)
              .filter(([key, t]) => t.sens === 'entree' && key !== 'entree')
              .map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
          </optgroup>
          <optgroup label="Sorties">
            {Object.entries(TYPES_MOUVEMENT)
              .filter(([key, t]) => t.sens === 'sortie' && key !== 'sortie')
              .map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
          </optgroup>
        </select>

        <select
          value={filtrePeriode}
          onChange={(e) => setFiltrePeriode(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
          <option value="mois">Ce mois</option>
          <option value="tout">Tout</option>
        </select>

        <button
          type="button"
          onClick={() => setModalOuvert(true)}
          className="sm:ml-auto flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium"
        >
          <Plus size={16} /> Nouveau mouvement
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {mouvementsEnrichis.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucun mouvement pour cette sélection.</p>
        )}
        {mouvementsEnrichis.map((m) => {
          const info = TYPES_MOUVEMENT[m.type] || { label: m.type, sens: m.quantite >= 0 ? 'entree' : 'sortie' };
          const estEntree = info.sens === 'entree';
          return (
            <div key={m.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full ${estEntree ? 'bg-brand-600' : 'bg-alert-600'}`} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{info.label}</p>
                  <p className="text-sm text-gray-900">{m.nomProduit}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(m.date).toLocaleString('fr-FR')} • Stock après : {m.stockApres}
                    {m.motif ? ` • ${m.motif}` : ''}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${estEntree ? 'text-brand-600' : 'text-alert-600'}`}>
                {estEntree ? '+' : ''}{m.quantite}
              </span>
            </div>
          );
        })}
      </div>

      {modalOuvert && (
        <NouveauMouvementModal
          produits={produits}
          utilisateurId={user?.id}
          onFerme={() => setModalOuvert(false)}
        />
      )}
    </div>
  );
}

function NouveauMouvementModal({ produits, utilisateurId, onFerme }) {
  const [produitId, setProduitId] = useState(produits[0]?.id || '');
  const [type, setType] = useState(TYPES_MOUVEMENT_MANUELS[0]);
  const [quantite, setQuantite] = useState('');
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const motifObligatoire = TYPES_AVEC_MOTIF_OBLIGATOIRE.includes(type);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    const quantiteNum = Number(quantite);
    if (!produitId) return setErreur('Choisis un produit.');
    if (!quantiteNum || quantiteNum <= 0) return setErreur('Indique une quantité valide (supérieure à 0).');
    if (motifObligatoire && !motif) return setErreur('Le motif est obligatoire pour ce type de mouvement.');

    const sens = TYPES_MOUVEMENT[type]?.sens;
    const quantiteSignee = sens === 'sortie' ? -quantiteNum : quantiteNum;

    setEnCours(true);
    try {
      await enregistrerMouvement({
        produitId,
        type,
        quantite: quantiteSignee,
        motif: motif || null,
        utilisateurId,
      });
      onFerme();
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Nouveau mouvement</h3>
          <button onClick={onFerme}><X size={18} className="text-gray-400" /></button>
        </div>

        {erreur && (
          <div className="mb-3 text-sm text-alert-600 bg-red-50 rounded-lg px-3 py-2">{erreur}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Produit</span>
            <select
              value={produitId}
              onChange={(e) => setProduitId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} (stock: {p.stock})</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Type de mouvement</span>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setMotif(''); }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {TYPES_MOUVEMENT_MANUELS.map((key) => (
                <option key={key} value={key}>{TYPES_MOUVEMENT[key].label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Quantité</span>
            <input
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          {(motifObligatoire || type === 'ajustement_negatif' || type === 'ajustement_positif') && (
            <label className="block">
              <span className="text-sm text-gray-700">
                Motif {motifObligatoire && <span className="text-alert-600">*</span>}
              </span>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">— Sélectionner —</option>
                {MOTIFS_SUGGERES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {enCours ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}