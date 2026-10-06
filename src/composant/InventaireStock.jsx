import { useState } from 'react';
import { db } from '../db/db';
import { useProduits } from '../services/useProduits';

export default function InventaireStock() {
  const { produits, recharger } = useProduits();
  const [comptages, setComptages] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  function handleComptage(produitId, valeur) {
    setComptages((prev) => ({ ...prev, [produitId]: valeur }));
  }

  function ecart(produit) {
    const compte = comptages[produit.id];
    if (compte === undefined || compte === '') return null;
    return Number(compte) - produit.quantite;
  }

  const produitsAvecEcart = produits.filter((p) => {
    const e = ecart(p);
    return e !== null && e !== 0;
  });

  async function validerInventaire() {
    if (produitsAvecEcart.length === 0) {
      setMessage('Aucun écart à corriger.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setEnCours(true);
    try {
      await db.transaction('rw', db.produits, db.mouvementsStock, async () => {
        for (const p of produitsAvecEcart) {
          const nouveauStock = Number(comptages[p.id]);
          const e = ecart(p);
          await db.produits.update(p.id, { quantite: nouveauStock });
          await db.mouvementsStock.add({
            produitId: p.id,
            type: e > 0 ? 'entree' : 'sortie',
            quantite: Math.abs(e),
            date: new Date().toISOString(),
          });
        }
      });
      setComptages({});
      await recharger();
      setMessage(`Inventaire validé : ${produitsAvecEcart.length} produit(s) ajusté(s).`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div>
      <div className="px-5 py-3 bg-blue-50 border-b border-gray-100">
        <p className="text-xs text-blue-700">
          Compte physiquement chaque produit et saisis la quantité trouvée. Les écarts seront corrigés à la validation.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {produits.map((p) => {
          const e = ecart(p);
          return (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nom}</p>
                <p className="text-xs text-gray-500">Stock enregistré: {p.stock}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Compté"
                  value={comptages[p.id] ?? ''}
                  onChange={(e) => handleComptage(p.id, e.target.value)}
                  className="w-20 text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
                {e !== null && e !== 0 && (
                  <span className={`text-xs font-medium w-14 text-right ${e > 0 ? 'text-brand-600' : 'text-alert-600'}`}>
                    {e > 0 ? '+' : ''}{e}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="mx-5 my-3 bg-green-50 text-brand-600 text-sm rounded-lg px-3 py-2">{message}</div>
      )}

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={validerInventaire}
          disabled={enCours || produitsAvecEcart.length === 0}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {enCours ? 'Validation...' : `Valider l'inventaire${produitsAvecEcart.length > 0 ? ` (${produitsAvecEcart.length} écart${produitsAvecEcart.length > 1 ? 's' : ''})` : ''}`}
        </button>
      </div>
    </div>
  );
}
