import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useClients } from '../services/useClients';
import FormulaireClient from '../composant/FormulaireClient';
import { useCurrency } from '../context/useCurrency';
/*function formatCFA(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}*/

export default function Clients() {
  const { formatMontant } = useCurrency();
  const { clients, ajouterClient, modifierClient } = useClients();
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [clientEnEdition, setClientEnEdition] = useState(null);

  const clientsFiltres = clients.filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  function ouvrirAjout() {
    setClientEnEdition(null);
    setModalOuvert(true);
  }

  function ouvrirEdition(client) {
    setClientEnEdition(client);
    setModalOuvert(true);
  }

  async function handleEnregistrer(donnees) {
    if (clientEnEdition) {
      await modifierClient(clientEnEdition.id, donnees);
    } else {
      await ajouterClient(donnees);
    }
    setModalOuvert(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Clients</h2>
        <button
          onClick={ouvrirAjout}
          className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {clientsFiltres.map((c) => (
          <button
            key={c.id}
            onClick={() => ouvrirEdition(c)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-medium text-brand-900">
                {c.nom[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{c.nom}</p>
                <p className="text-xs text-gray-500">{c.telephone}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${c.solde > 0 ? 'text-alert-600' : 'text-gray-900'}`}>
              Solde: {formatMontant(c.solde || 0)}
            </span>
          </button>
        ))}
        {clientsFiltres.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Aucun client trouvé.</p>
        )}
      </div>

      {modalOuvert && (
        <FormulaireClient
          client={clientEnEdition}
          onEnregistrer={handleEnregistrer}
          onFermer={() => setModalOuvert(false)}
        />
      )}
    </div>
  );
}

