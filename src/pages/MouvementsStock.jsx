

import { useState, useEffect } from 'react';
import { db } from '../db/db';

function MouvementsStock() {
  const [mouvements, setMouvements] = useState([]);

  useEffect(() => {
    async function charger() {
      const tous = await db.mouvementsStock.orderBy('date').reverse().limit(50).toArray();
      const produits = await db.produits.toArray();
      const enrichis = tous.map((m) => ({
        ...m,
        nomProduit: produits.find((p) => p.id === m.produitId)?.nom || 'Produit supprimé',
      }));
      setMouvements(enrichis);
    }
    charger();
  }, []);

  return (
    <div className="divide-y divide-gray-100">
      {mouvements.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Aucun mouvement enregistré.</p>
      )}
      {mouvements.map((m) => (
        <div key={m.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm text-gray-900">{m.nomProduit}</p>
            <p className="text-xs text-gray-500">{new Date(m.date).toLocaleString('fr-FR')}</p>
          </div>
          <span className={`text-sm font-medium ${m.type === 'entree' ? 'text-brand-600' : 'text-alert-600'}`}>
            {m.type === 'entree' ? '+' : '-'}{m.quantite}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MouvementsStock;
