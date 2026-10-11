// components/BoutonTelechargerRecu.jsx
import { FileDown } from 'lucide-react';
import { db } from '../db/db';
import { genererFacturePDF } from '../services/factureService';

export default function BoutonTelechargerRecu({ vente, boutique, className = '' }) {
 async function handleTelechargement() {
  const lignesBrutes = await db.venteLignes.where('venteId').equals(vente.id).toArray();
  const lignes = await Promise.all(
    lignesBrutes.map(async (l) => ({
      ...l,
      nomProduit: (await db.produits.get(l.produitId))?.nom || 'Produit supprimé',
    }))
  );
  const client = vente.clientId ? await db.clients.get(vente.clientId) : null;
  genererFacturePDF(vente, lignes, boutique, client);
}

  return (
    <button
      onClick={handleTelechargement}
      className={`flex items-center gap-2 text-sm text-brand-600 font-medium ${className}`}
    >
      <FileDown size={16} /> Reçu
    </button>
  );
}