import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

function debutPeriode(periode) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (periode === 'jour') return d;
  if (periode === 'semaine') {
    const jourSemaine = d.getDay();
    const decalage = jourSemaine === 0 ? 6 : jourSemaine - 1;
    d.setDate(d.getDate() - decalage);
    return d;
  }
  if (periode === 'mois') {
    d.setDate(1);
    return d;
  }
  return new Date(0);
}

export function useDashboardStats(periode = 'jour') {
  const [stats, setStats] = useState({
    ventes: 0,
    benefice: 0,
    produitsEnStock: 0,
    dettesTotal: 0,
    nombreClientsDettes: 0,
  });

  const charger = useCallback(async () => {
    const debut = debutPeriode(periode);

    const ventesPeriode = await db.ventes.where('date').aboveOrEqual(debut.toISOString()).toArray();
    const ventes = ventesPeriode.reduce((sum, v) => sum + v.total, 0);

    const produits = await db.produits.toArray();
    const produitsEnStock = produits.reduce((sum, p) => sum + (p.stock || 0), 0);

    const idsVentesPeriode = new Set(ventesPeriode.map((v) => v.id));
    const toutesLignes = await db.venteLignes.toArray();
    const lignesPeriode = toutesLignes.filter((l) => idsVentesPeriode.has(l.venteId));

    let benefice = 0;
    for (const ligne of lignesPeriode) {
      const produit = produits.find((p) => p.id === ligne.produitId);
      if (produit) benefice += (ligne.prixUnitaire - produit.prixAchat) * ligne.quantite;
    }

    const dettes = await db.dettes.toArray();
    const dettesImpayees = dettes.filter((d) => d.statut !== 'reglee');
    const dettesTotal = dettesImpayees.reduce((sum, d) => sum + d.montant, 0);
    const nombreClientsDettes = new Set(dettesImpayees.map((d) => d.clientId)).size;

    setStats({ ventes, benefice, produitsEnStock, dettesTotal, nombreClientsDettes });
  }, [periode]);

  useEffect(() => {
    charger();
  }, [charger]);

  return stats;
}