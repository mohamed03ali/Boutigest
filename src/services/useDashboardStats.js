import { useState, useEffect } from 'react';
import { db } from '../db/db';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    venteDuJour: 0,
    beneficeDuMois: 0,
    produitsEnStock: 0,
    dettesTotal: 0,
    nombreClientsDettes: 0,
  });

  useEffect(() => {
    async function charger() {
      const debutJour = new Date();
      debutJour.setHours(0, 0, 0, 0);

      const ventesDuJour = await db.ventes
        .where('date').aboveOrEqual(debutJour.toISOString()).toArray();
      const venteDuJour = ventesDuJour.reduce((sum, v) => sum + v.total, 0);

      const produits = await db.produits.toArray();
      const produitsEnStock = produits.reduce((sum, p) => sum + (p.stock || 0), 0);

      const dettes = await db.dettes.toArray();
      const dettesImpayees = dettes.filter((d) => d.statut !== 'reglee');
      const dettesTotal = dettesImpayees.reduce((sum, d) => sum + d.montant, 0);
      const nombreClientsDettes = new Set(dettesImpayees.map((d) => d.clientId)).size;

      setStats({ venteDuJour, produitsEnStock, dettesTotal, nombreClientsDettes, beneficeDuMois: 0 });
    }
    charger();
  }, []);

  return stats;
}
