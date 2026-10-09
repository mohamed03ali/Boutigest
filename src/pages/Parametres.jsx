import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, Upload, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../db/db';
import { useAuth } from '../services/useAuth';
import { useSyncAuto } from '../services/useSyncAuto';
import { useBoutique } from '../services/useBoutique';
import { getDerniereSync } from '../services/syncMeta';
import ConfirmModal from '../composant/ui/ConfirmModal';
import PhotoBoutique from '../composant/PhotoBoutique';

const TABLES_SCOPEES = ['produits', 'ventes', 'venteLignes', 'mouvementsStock', 'clients', 'dettes', 'depenses', 'categories'];

export default function Parametres() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { enCours, dernierResultat, lancerSync } = useSyncAuto();
  const { boutique } = useBoutique();
  const fichierInputRef = useRef(null);
  const boutiqueId = user?.boutiqueId;

  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false);
  const [confirmRestauration, setConfirmRestauration] = useState(false);
  const [fichierARestaurer, setFichierARestaurer] = useState(null);
  const [messageRestauration, setMessageRestauration] = useState('');

  function confirmerDeconnexion() {
    setConfirmDeconnexion(false);
    logout();
    navigate('/connexion');
  }

  async function exporterSauvegarde() {
    if (!boutiqueId) return;
    const ventes = await db.ventes.where('boutiqueId').equals(boutiqueId).toArray();
    const idsVentes = new Set(ventes.map((v) => v.id));
    const toutesLignes = await db.venteLignes.toArray();

    const donnees = {
      produits: await db.produits.where('boutiqueId').equals(boutiqueId).toArray(),
      ventes,
      venteLignes: toutesLignes.filter((l) => idsVentes.has(l.venteId)),
      mouvementsStock: await db.mouvementsStock.where('boutiqueId').equals(boutiqueId).toArray(),
      clients: await db.clients.where('boutiqueId').equals(boutiqueId).toArray(),
      dettes: await db.dettes.where('boutiqueId').equals(boutiqueId).toArray(),
      depenses: await db.depenses.where('boutiqueId').equals(boutiqueId).toArray(),
      categories: await db.categories.where('boutiqueId').equals(boutiqueId).toArray(),
      boutiques: boutique ? [boutique] : [],
      exporteLe: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boutigest-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleChoixFichierRestauration(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setFichierARestaurer(fichier);
    setConfirmRestauration(true);
  }

  async function confirmerRestauration() {
    setConfirmRestauration(false);
    setMessageRestauration('');
    try {
      const texte = await fichierARestaurer.text();
      const donnees = JSON.parse(texte);

      await db.transaction(
        'rw',
        [db.produits, db.ventes, db.venteLignes, db.mouvementsStock, db.clients, db.dettes, db.depenses, db.categories, db.boutiques],
        async () => {
          // On ne touche qu'aux données DE CETTE BOUTIQUE : on supprime seulement
          // les lignes déjà liées à boutiqueId avant de réinsérer celles du fichier,
          // pour ne jamais effacer les données d'une autre boutique.
          for (const table of TABLES_SCOPEES) {
            const lignes = donnees[table];
            if (!Array.isArray(lignes) || !db[table]) continue;
            await db[table].where('boutiqueId').equals(boutiqueId).delete();
            await db[table].bulkAdd(lignes.map((l) => ({ ...l, boutiqueId })));
          }
          if (Array.isArray(donnees.boutiques) && donnees.boutiques[0]) {
            await db.boutiques.update(boutiqueId, { ...donnees.boutiques[0], id: boutiqueId });
          }
        }
      );
      setMessageRestauration('Sauvegarde restaurée avec succès.');
    } catch {
      setMessageRestauration("Le fichier n'est pas une sauvegarde Boutigest valide.");
    } finally {
      setFichierARestaurer(null);
      if (fichierInputRef.current) fichierInputRef.current.value = '';
    }
  }

  const derniereSync = getDerniereSync();
  const derniereSyncLisible =
    derniereSync === '1970-01-01T00:00:00.000Z'
      ? 'Jamais synchronisé'
      : new Date(derniereSync).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Paramètres</h1>

      <section className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profil boutique</h2>
        <div className="flex items-center gap-4">
          <PhotoBoutique boutique={boutique} />
          <div>
            <p className="font-medium text-gray-900">{boutique?.nom || 'Ma Boutique'}</p>
            <p className="text-sm text-gray-500">{boutique?.typeCommerce || 'Non défini'}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Synchronisation</h2>
        <p className="text-xs text-gray-500 mb-4">Dernière synchronisation : {derniereSyncLisible}</p>
        <button
          onClick={lancerSync}
          disabled={enCours}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-100 text-brand-600 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          <RefreshCw size={16} className={enCours ? 'animate-spin' : ''} />
          {enCours ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
        </button>
        {dernierResultat && !enCours && (
          <div className={`mt-3 flex items-center gap-2 text-xs ${dernierResultat.succes ? 'text-good-600' : 'text-alert-600'}`}>
            {dernierResultat.succes ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {dernierResultat.succes
              ? (dernierResultat.erreursPartielles ? 'Synchronisé avec quelques erreurs.' : 'Synchronisé avec succès.')
              : dernierResultat.erreur}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Sauvegarde locale</h2>
        <div className="flex gap-3">
          <button onClick={exporterSauvegarde} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-700 py-2.5 text-sm font-medium hover:bg-gray-50">
            <Download size={16} /> Exporter
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-700 py-2.5 text-sm font-medium hover:bg-gray-50 cursor-pointer">
            <Upload size={16} /> Restaurer
            <input ref={fichierInputRef} type="file" accept=".json" onChange={handleChoixFichierRestauration} className="hidden" />
          </label>
        </div>
        {messageRestauration && <p className="text-xs text-gray-500 mt-3">{messageRestauration}</p>}
      </section>

      <button onClick={() => setConfirmDeconnexion(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-alert-600 py-2.5 text-sm font-medium">
        <LogOut size={16} /> Déconnexion
      </button>

      {confirmDeconnexion && (
        <ConfirmModal titre="Se déconnecter ?" message="Tu devras te reconnecter pour accéder à la boutique."
          labelConfirmer="Déconnexion" variant="danger" onConfirmer={confirmerDeconnexion} onAnnuler={() => setConfirmDeconnexion(false)} />
      )}
      {confirmRestauration && (
        <ConfirmModal titre="Restaurer cette sauvegarde ?" message="Les données actuelles de CETTE boutique seront remplacées par celles du fichier. Cette action est irréversible."
          labelConfirmer="Restaurer" variant="danger" onConfirmer={confirmerRestauration}
          onAnnuler={() => { setConfirmRestauration(false); setFichierARestaurer(null); if (fichierInputRef.current) fichierInputRef.current.value = ''; }} />
      )}
    </div>
  );
}