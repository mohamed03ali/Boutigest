import { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { History } from 'lucide-react';
import { useZakat } from '../services/useZakat';
import { useCurrency } from '../context/useCurrency';

/*function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' FCFA';
}*/

export default function Zakat() {
  const { formatMontant } = useCurrency();
  const { valeurStockActuelle, creancesActuelles, calculer, enregistrerCalcul } = useZakat();

  const [form, setForm] = useState({
    argentCaisse: '',
    argentBanque: '',
    valeurStock: 0,
    creances: 0,
    dettesCourtTerme: '',
    nisab: 722000,
  });
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function precharger() {
      const stock = await valeurStockActuelle();
      const creances = await creancesActuelles();
      setForm((prev) => ({ ...prev, valeurStock: stock, creances }));
    }
    precharger();
  }, [creancesActuelles, valeurStockActuelle]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  }

  const resultat = calculer({
    argentCaisse: form.argentCaisse,
    argentBanque: form.argentBanque,
    valeurStock: form.valeurStock,
    creances: form.creances,
    dettesCourtTerme: form.dettesCourtTerme,
    nisab: form.nisab,
  });

  async function handleEnregistrer() {
    setChargement(true);
    try {
      await enregistrerCalcul(form);
      setMessage('Calcul enregistré dans l\'historique.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Calcul de la Zakat</h2>
      <div className="flex items-center justify-between  mb-1">
1        <h2 className='font-semibold text-gray-900 mb-1'>Historique des calculs</h2>
          < Link to="/zakat/historique" className="flex items-center gap-1 text-xs text-brand-600 font-meduim">
          <History size={14} />
          Voir l'historique
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Nisab basé sur : Argent en caisse ({formatMontant(form.nisab)})
      </p>

      <div className="space-y-3 mb-4">
        <label className="block">
          <span className="text-sm text-gray-700">Argent en caisse</span>
          <input
            type="number" name="argentCaisse" value={form.argentCaisse} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Argent en banque</span>
          <input
            type="number" name="argentBanque" value={form.argentBanque} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Valeur du stock (auto)</span>
          <input
            type="number" name="valeurStock" value={form.valeurStock} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Créances récupérables (auto)</span>
          <input
            type="number" name="creances" value={form.creances} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Dettes à court terme</span>
          <input
            type="number" name="dettesCourtTerme" value={form.dettesCourtTerme} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Nisab (seuil)</span>
          <input
            type="number" name="nisab" value={form.nisab} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="bg-brand-100 rounded-xl p-4 mb-4">
        <p className="text-xs text-brand-900 font-medium">Richesse soumise</p>
        <p className="text-xl font-bold text-brand-900">{formatMontant(resultat.richesseSoumise)}</p>
        <div className="border-t border-brand-900/10 mt-3 pt-3 flex justify-between items-center">
          <span className="text-sm text-brand-900">Zakat à payer (2,5%)</span>
          <span className="text-lg font-semibold text-brand-900">{formatMontant(resultat.montantZakat)}</span>
        </div>
        {!resultat.eligible && (
          <p className="text-xs text-brand-900/60 mt-2">
            Richesse soumise sous le Nisab — Zakat non obligatoire cette année.
          </p>
        )}
      </div>

      {message && (
        <div className="bg-green-50 text-brand-600 text-sm rounded-lg px-3 py-2 mb-3">{message}</div>
      )}

      <button
        onClick={handleEnregistrer}
        disabled={chargement}
        className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {chargement ? 'Enregistrement...' : 'Enregistrer et calculer'}
      </button>
    </div>
  );
}