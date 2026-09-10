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

export function useRapports() {
  const [donnees, setDonnees] = useState({
    totalVentes: 0,
    totalDepenses: 0,
    beneficeBrut: 0,
    beneficeNet: 0,
    repartitionParCategorie: [],
  });

  const calculer = useCallback(async (periode = 'mois') => {
    const debut = debutPeriode(periode);

    const ventes = await db.ventes.where('date').aboveOrEqual(debut.toISOString()).toArray();
    const venteLignes = await db.venteLignes.toArray();
    const produits = await db.produits.toArray();
    const depenses = await db.depenses.where('date').aboveOrEqual(debut.toISOString()).toArray();

    const idsVentesPeriode = new Set(ventes.map((v) => v.id));
    const lignesPeriode = venteLignes.filter((l) => idsVentesPeriode.has(l.venteId));

    let beneficeBrut = 0;
    const parCategorie = {};

    for (const ligne of lignesPeriode) {
      const produit = produits.find((p) => p.id === ligne.produitId);
      if (!produit) continue;
      beneficeBrut += (ligne.prixUnitaire - produit.prixAchat) * ligne.quantite;
      const cat = produit.categorie || 'Autre';
      parCategorie[cat] = (parCategorie[cat] || 0) + ligne.prixUnitaire * ligne.quantite;
    }

    const totalVentes = ventes.reduce((sum, v) => sum + v.total, 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    const beneficeNet = beneficeBrut - totalDepenses;

    const totalCategories = Object.values(parCategorie).reduce((a, b) => a + b, 0) || 1;
    const repartitionParCategorie = Object.entries(parCategorie).map(([nom, valeur]) => ({
      nom, valeur, pourcentage: Math.round((valeur / totalCategories) * 100),
    }));

    setDonnees({ totalVentes, totalDepenses, beneficeBrut, beneficeNet, repartitionParCategorie });
  }, []);

  useEffect(() => {
    calculer('mois'); // valeur par défaut au premier chargement
  }, [calculer]);

  return { ...donnees, recalculer: calculer };
}