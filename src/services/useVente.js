import { useState } from 'react';
import { db } from '../db/db';

export function useVente(produits) {
  const [panier, setPanier] = useState([]);
  const [alerte, setAlerte] = useState('');

  function stockDisponible(produitId) {
    return produits.find((p) => p.id === produitId)?.stock ?? 0;
  }

  function ajouterAuPanier(produit) {
    setAlerte('');
    const dejaDansPanier = panier.find((l) => l.produitId === produit.id)?.quantite || 0;

    if (dejaDansPanier + 1 > produit.stock) {
      setAlerte(`Stock insuffisant pour "${produit.nom}" (${produit.stock} disponible${produit.stock > 1 ? 's' : ''}).`);
      return;
    }

    setPanier((prev) => {
      const existant = prev.find((l) => l.produitId === produit.id);
      if (existant) {
        return prev.map((l) =>
          l.produitId === produit.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [...prev, { produitId: produit.id, nom: produit.nom, prixVente: produit.prixVente, quantite: 1 }];
    });
  }

  function changerQuantite(produitId, delta) {
    setAlerte('');
    if (delta > 0) {
      const ligne = panier.find((l) => l.produitId === produitId);
      const disponible = stockDisponible(produitId);
      if (ligne && ligne.quantite + delta > disponible) {
        setAlerte(`Stock maximum atteint (${disponible} disponible${disponible > 1 ? 's' : ''}).`);
        return;
      }
    }
    setPanier((prev) =>
      prev
        .map((l) => (l.produitId === produitId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    );
  }

  function viderPanier() {
    setPanier([]);
  }

  const sousTotal = panier.reduce((sum, l) => sum + l.prixVente * l.quantite, 0);

 
async function encaisser(remise = 0, clientId = null, modePaiement = 'cash') {
  if (panier.length === 0) return null;
  if (modePaiement === 'credit' && !clientId) {
    setAlerte('Sélectionnez un client pour une vente à crédit.');
    return null;
  }

  const total = sousTotal - remise;

  try {
    const venteId = await db.transaction(
      'rw', db.ventes, db.venteLignes, db.produits, db.mouvementsStock, db.dettes, db.clients,
      async () => {
        for (const ligne of panier) {
          const produit = await db.produits.get(ligne.produitId);
          if (!produit || produit.stock < ligne.quantite) {
            throw new Error(`Stock insuffisant pour "${ligne.nom}".`);
          }
        }

        const id = await db.ventes.add({
          date: new Date().toISOString(), total, remise, clientId, modePaiement,
        });

        for (const ligne of panier) {
          await db.venteLignes.add({
            venteId: id, produitId: ligne.produitId, quantite: ligne.quantite, prixUnitaire: ligne.prixVente,
          });
          const produit = await db.produits.get(ligne.produitId);
          await db.produits.update(ligne.produitId, { stock: produit.stock - ligne.quantite });
          await db.mouvementsStock.add({
            produitId: ligne.produitId, type: 'sortie', quantite: ligne.quantite, date: new Date().toISOString(),
          });
        }

        // Si vente à crédit : on crée la dette dans la MÊME transaction
        if (modePaiement === 'credit') {
          await db.dettes.add({
            clientId, montant: total, date: new Date().toISOString(), statut: 'retard', venteId: id,
          });
          const client = await db.clients.get(clientId);
          await db.clients.update(clientId, { solde: (client.solde || 0) + total });
        }

        return id;
      }
    );

    viderPanier();
    return venteId;
  } catch (err) {
    setAlerte(err.message);
    return null;
  }
}


  return { panier, ajouterAuPanier, changerQuantite, viderPanier, sousTotal, encaisser, alerte };
}


