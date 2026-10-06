import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useProduits } from '../services/useProduits';
import { useInventaires } from '../services/useInventaires';

const MOTIFS = ['Perte', 'Casse / Produit endommagé', 'Vol', 'Erreur de saisie', 'Produit retrouvé', "Erreur d'inventaire", 'Autre'];

export default function NouvelInventaire({ onTermine }) {
  const { produits } = useProduits();
  const { demarrerInventaire, enregistrerComptage, validerInventaire } = useInventaires();

  const [etape, setEtape] = useState('selection');
  const [type, setType] = useState('complet');
  const [produitsSelectionnes, setProduitsSelectionnes] = useState(new Set());
  const [comptages, setComptages] = useState({});
  const [inventaireId, setInventaireId] = useState(null);
  const [enCours, setEnCours] = useState(false);

  function toggleProduit(id) {
    setProduitsSelectionnes((prev) => {
      const copie = new Set(prev);
      copie.has(id) ? copie.delete(id) : copie.add(id);
      return copie;
    });
  }

  const produitsACompter = type === 'complet' ? produits : produits.filter((p) => produitsSelectionnes.has(p.id));

  async function demarrer() {
    if (produitsACompter.length === 0) return;
    const id = await demarrerInventaire(type === 'complet' ? undefined : produitsACompter);
    setInventaireId(id);

    const initial = {};
    produitsACompter.forEach((p) => { initial[p.id] = { stockReel: String(p.stock), motif: '' }; });
    setComptages(initial);
    setEtape('comptage');
  }

  function majComptage(produitId, champ, valeur) {
    setComptages((prev) => ({ ...prev, [produitId]: { ...prev[produitId], [champ]: valeur } }));
  }

  const nombreComptes = Object.values(comptages).filter((c) => c.stockReel !== '').length;
  const nombreEcarts = produitsACompter.filter((p) => {
    const c = comptages[p.id];
    return c && c.stockReel !== '' && Number(c.stockReel) !== p.stock;
  }).length;

  async function valider() {
    setEnCours(true);
    try {
      for (const p of produitsACompter) {
        const c = comptages[p.id];
        if (!c || c.stockReel === '') continue;
        await enregistrerComptage(inventaireId, p, Number(c.stockReel), c.motif || null);
      }
      await validerInventaire(inventaireId);
      onTermine(inventaireId);
    } finally {
      setEnCours(false);
    }
  }

  if (etape === 'selection') {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onTermine(null)} className="text-gray-400"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-semibold text-gray-900">Nouvel inventaire</h1>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'inventaire</label>
            <div className="flex gap-2">
              <button onClick={() => setType('complet')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'complet' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Complet
              </button>
              <button onClick={() => setType('partiel')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'partiel' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Partiel
              </button>
            </div>
          </div>

          {type === 'partiel' && (
            <div className="space-y-1 max-h-72 overflow-y-auto border-t border-gray-100 pt-3">
              {produits.map((p) => (
                <label key={p.id} className="flex items-center gap-3 py-2 px-1">
                  <input type="checkbox" checked={produitsSelectionnes.has(p.id)} onChange={() => toggleProduit(p.id)} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{p.nom}</span>
                </label>
              ))}
            </div>
          )}

          <button onClick={demarrer} disabled={type === 'partiel' && produitsSelectionnes.size === 0} className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
            Commencer le comptage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setEtape('selection')} className="text-gray-400"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-semibold text-gray-900">Comptage</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_70px_60px] gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <span>Produit</span><span className="text-right">Théoq.</span><span className="text-right">Réel</span><span className="text-right">Écart</span>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {produitsACompter.map((p) => {
            const c = comptages[p.id] || { stockReel: '', motif: '' };
            const ecart = c.stockReel !== '' ? Number(c.stockReel) - p.stock: null;
            return (
              <div key={p.id} className="px-4 py-2.5">
                <div className="grid grid-cols-[1fr_70px_70px_60px] gap-2 items-center">
                  <span className="text-sm text-gray-900 truncate">{p.nom}</span>
                  <span className="text-sm text-gray-500 text-right">{p.stock}</span>
                  <input type="number" value={c.stockReel} onChange={(e) => majComptage(p.id, 'stockReel', e.target.value)} className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm" />
                  <span className={`text-sm text-right font-medium ${ecart > 0 ? 'text-good-600' : ecart < 0 ? 'text-alert-600' : 'text-gray-400'}`}>
                    {ecart === null ? '—' : ecart > 0 ? `+${ecart}` : ecart}
                  </span>
                </div>
                {ecart !== null && ecart !== 0 && (
                  <select value={c.motif} onChange={(e) => majComptage(p.id, 'motif', e.target.value)} className="mt-2 w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                    <option value="">Motif de l'écart...</option>
                    {MOTIFS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-sm">
        <span className="text-gray-500">Produits comptés : {nombreComptes}/{produitsACompter.length}</span>
        <span className="text-gray-500">Écarts : {nombreEcarts}</span>
      </div>

      <button onClick={valider} disabled={enCours || nombreComptes === 0} className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
        {enCours ? 'Validation...' : "Valider l'inventaire"}
      </button>
    </div>
  );
}