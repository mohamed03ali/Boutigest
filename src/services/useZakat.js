import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

const TAUX_ZAKAT = 0.025;

export function useZakat() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const historique = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const liste = await db.zakats.where('boutiqueId').equals(boutiqueId).and((z) => !z.deleted).toArray();
    return liste.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [boutiqueId]);

  async function valeurStockActuelle() {
    if (!boutiqueId) return 0;
    const produits = await db.produits.where('boutiqueId').equals(boutiqueId).and((p) => !p.deleted).toArray();
    return produits.reduce((sum, p) => sum + (p.prixAchat || 0) * (p.stock || 0), 0);
  }

  async function creancesActuelles() {
    if (!boutiqueId) return 0;
    const dettes = await db.dettes.where('boutiqueId').equals(boutiqueId).and((d) => !d.deleted).toArray();
    return dettes.filter((d) => d.statut !== 'reglee').reduce((sum, d) => sum + d.montant, 0);
  }

  function calculer({ argentCaisse, argentBanque, valeurStock, creances, dettesCourtTerme, nisab }) {
    const richesseSoumise = argentCaisse + argentBanque + valeurStock + creances - dettesCourtTerme;
    const eligible = richesseSoumise >= nisab;
    const montantZakat = eligible ? richesseSoumise * TAUX_ZAKAT : 0;
    return { richesseSoumise, eligible, montantZakat };
  }

  async function enregistrerCalcul(donnees) {
    if (!boutiqueId) return;
    const { richesseSoumise, montantZakat } = calculer(donnees);
    const maintenant = new Date().toISOString();
    await db.zakats.add({
      ...donnees, id: crypto.randomUUID(), boutiqueId, richesseSoumise, montantZakat,
      date: maintenant, paye: false, updatedAt: maintenant, deleted: false,
    });
  }

  async function marquerPaye(id) {
    await db.zakats.update(id, { paye: true, updatedAt: new Date().toISOString() });
  }

  return { historique: historique || [], valeurStockActuelle, creancesActuelles, calculer, enregistrerCalcul, marquerPaye };
}