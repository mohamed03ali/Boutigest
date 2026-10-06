import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const TAUX_ZAKAT = 0.025;

export function useZakat() {
  const historique = useLiveQuery(
    () => db.zakats.orderBy('date').reverse().filter((z) => !z.deleted).toArray(),
    []
  );

  async function valeurStockActuelle() {
    const produits = await db.produits.filter((p) => !p.deleted).toArray();
    return produits.reduce((sum, p) => sum + (p.prixAchat || 0) * (p.stock || 0), 0);
  }

  async function creancesActuelles() {
    const dettes = await db.dettes.filter((d) => !d.deleted).toArray();
    return dettes.filter((d) => d.statut !== 'reglee').reduce((sum, d) => sum + d.montant, 0);
  }

  function calculer({ argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab }) {
    const richesseSoumise = argentCaisse + argentBanque + valeurStock + creances - dettesCourtTerme;
    const eligible = richesseSoumise >= nisab;
    const montantZakat = eligible ? richesseSoumise * TAUX_ZAKAT : 0;
    return { richesseSoumise, eligible, montantZakat };
  }

  async function enregistrerCalcul(donnees) {
    const { richesseSoumise, montantZakat } = calculer(donnees);
    const maintenant = new Date().toISOString();
    await db.zakats.add({
      ...donnees, id: crypto.randomUUID(), richesseSoumise, montantZakat,
      date: maintenant, paye: false, updatedAt: maintenant, deleted: false,
    });
  }

  async function marquerPaye(id) {
    await db.zakats.update(id, { paye: true, updatedAt: new Date().toISOString() });
  }

  return { historique: historique || [], valeurStockActuelle, creancesActuelles, calculer, enregistrerCalcul, marquerPaye };
}