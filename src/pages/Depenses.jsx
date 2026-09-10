import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDepenses } from '../services/useDepenses';
import FormulaireDepense from '../composant/FormulaireDepense';

function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

const ICONES_CATEGORIE = {
  'Achat marchandises': '🛒',
  Transport: '🚗',
  Loyer: '🏠',
  Électricité: '⚡',
  Divers: '📦',
};

export default function Depenses() {
  const { depenses, ajouterDepense, supprimerDepense, totalMois } = useDepenses();
  const [modalOuvert, setModalOuvert] = useState(false);

  async function handleAjouter(donnees) {
    await ajouterDepense(donnees);
    setModalOuvert(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Dépenses</h2>
        <button
          onClick={() => setModalOuvert(true)}
          className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="p-5 border-b border-gray-100">
        <div className="bg-red-50 rounded-lg px-4 py-3">
          <p className="text-xs text-alert-600 font-medium">Total dépenses (mois)</p>
          <p className="text-lg font-semibold text-gray-900">{formatCFA(totalMois)}</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {depenses.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">{ICONES_CATEGORIE[d.categorie] || '📦'}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{d.libelle}</p>
                <p className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-alert-600">{formatCFA(d.montant)}</span>
              <button onClick={() => supprimerDepense(d.id)}>
                <Trash2 size={16} className="text-gray-300 hover:text-alert-600" />
              </button>
            </div>
          </div>
        ))}
        {depenses.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucune dépense enregistrée.</p>
        )}
      </div>

      {modalOuvert && (
        <FormulaireDepense onEnregistrer={handleAjouter} onFermer={() => setModalOuvert(false)} />
      )}
    </div>
  );
}

