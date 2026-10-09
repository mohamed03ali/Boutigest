import { useState } from 'react';
import { Search } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import { useVente } from '../services/useVente';
import { useClients } from '../services/useClients';
import { useCurrency } from '../context/useCurrency';
import { useBoutique } from '../services/useBoutique';
import { useAuth } from '../services/useAuth';
import { genererFacturePDF } from '../services/factureService';
import { db } from '../db/db';

export default function Ventes() {
  const { formatMontant } = useCurrency();
  const { produits } = useProduits();
  const { user } = useAuth();
  const { panier, ajouterAuPanier, changerQuantite, sousTotal, encaisser, alerte } = useVente(produits, user?.id);
  const { boutique } = useBoutique();
  const { clients } = useClients();
  const [recherche, setRecherche] = useState('');
  const [remise, setRemise] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [modePaiement, setModePaiement] = useState('cash');
  const [clientSelectionne, setClientSelectionne] = useState('');
  const [venteConfirmee, setVenteConfirmee] = useState(null);

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );
  const total = sousTotal - remise;

  async function handleEncaisser() {
    setEnCours(true);
    try {
      const venteId = await encaisser(remise, modePaiement === 'credit' ? clientSelectionne : null, modePaiement);
      if (venteId) {
        const vente = await db.ventes.get(venteId);
        const lignesBrutes = await db.venteLignes.where('venteId').equals(venteId).toArray();
        const lignes = lignesBrutes.map((l) => ({
          ...l,
          nomProduit: produits.find((p) => p.id === l.produitId)?.nom || 'Produit',
        }));
        setVenteConfirmee({ vente, lignes });
        setRemise(0);
        setClientSelectionne('');
        setModePaiement('cash');
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Colonne gauche : recherche produits */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Produits</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit (code, nom...)"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {produitsFiltres.map((p) => (
            <button
              key={p.id}
              onClick={() => ajouterAuPanier(p)}
              disabled={p.stock <= 0}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <p className="text-sm text-gray-900">{p.nom}</p>
                <p className={`text-xs ${p.stock <= 0 ? 'text-alert-600 font-medium' : 'text-gray-500'}`}>
                  {p.stock <= 0 ? 'Rupture de stock' : `Stock: ${p.stock}`}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatMontant(p.prixVente)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colonne droite : panier / encaissement */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
        <h2 className="font-semibold text-gray-900 mb-3">Nouvelle vente</h2>

        {alerte && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-3">
            {alerte}
          </div>
        )}

        <div className="flex-1 space-y-2 overflow-y-auto">
          {panier.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Panier vide — sélectionnez un produit.</p>
          )}
          {panier.map((l) => (
            <div key={l.produitId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm text-gray-900">{l.nom}</p>
                <p className="text-xs text-gray-500">Stock: —</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changerQuantite(l.produitId, -1)} className="w-6 h-6 rounded bg-gray-200 text-sm">−</button>
                <span className="text-sm w-4 text-center">{l.quantite}</span>
                <button onClick={() => changerQuantite(l.produitId, 1)} className="w-6 h-6 rounded bg-gray-200 text-sm">+</button>
                <span className="text-sm font-medium w-20 text-right">{formatMontant(l.prixVente * l.quantite)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span><span>{formatMontant(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span>Remise</span>
            <input
              type="number" value={remise} onChange={(e) => setRemise(Number(e.target.value) || 0)}
              className="w-24 text-right border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-1">
            <span>Total</span><span>{formatMontant(total)}</span>
          </div>
        </div>

        <select
          value={clientSelectionne}
          onChange={(e) => setClientSelectionne(e.target.value)}
          className="w-full mb-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setModePaiement('cash')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              modePaiement === 'cash' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setModePaiement('credit')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              modePaiement === 'credit' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Crédit
          </button>
        </div>

        <button
          onClick={handleEncaisser}
          disabled={panier.length === 0 || enCours}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium mt-3 disabled:opacity-50"
        >
          {enCours ? 'Encaissement...' : 'Encaisser'}
        </button>
      </div>

      {venteConfirmee && (
        <ModalConfirmationVente
          vente={venteConfirmee.vente}
          lignes={venteConfirmee.lignes}
          boutique={boutique}
          client={clients.find((c) => c.id === venteConfirmee.vente.clientId)}
          onFermer={() => setVenteConfirmee(null)}
        />
      )}
    </div>
  );
}

function ModalConfirmationVente({ vente, lignes, boutique, client, onFermer }) {
  const { formatMontant } = useCurrency();

  function telecharger() {
    genererFacturePDF(vente, lignes, boutique, client);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 text-2xl">
          ✅
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">Vente enregistrée</h3>
        <p className="text-sm text-gray-500 mb-5">
          {formatMontant(vente.total)} encaissés{client ? ` — ${client.nom}` : ''}
        </p>

        <div className="space-y-2">
          <button
            onClick={telecharger}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium"
          >
            Télécharger le reçu
          </button>
          <button
            onClick={onFermer}
            className="w-full bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}