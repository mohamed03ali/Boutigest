import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const notifications = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const liste = await db.notifications.where('boutiqueId').equals(boutiqueId).and((n) => !n.deleted).toArray();
    return liste.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  }, [boutiqueId]);

  async function creerNotification(type, titre, message, referenceId = null) {
    if (!boutiqueId) return;
    const maintenant = new Date().toISOString();
    await db.notifications.add({
      id: crypto.randomUUID(), type, titre, message, referenceId, boutiqueId,
      date: maintenant, lue: false, updatedAt: maintenant, deleted: false,
    });
  }

  async function marquerLue(id) {
    await db.notifications.update(id, { lue: true, updatedAt: new Date().toISOString() });
  }

  async function verifierAlertes() {
    if (!boutiqueId) return;
    const produits = await db.produits.where('boutiqueId').equals(boutiqueId).and((p) => !p.deleted).toArray();
    const faibles = produits.filter((p) => p.stock > 0 && p.stock <= (p.seuilReappro || 10));

    for (const p of faibles) {
      const dejaExiste = await db.notifications
        .where('referenceId').equals(`produit-${p.id}`)
        .and((n) => n.type === 'stock_faible' && n.boutiqueId === boutiqueId && !n.deleted)
        .first();

      if (!dejaExiste) {
        await creerNotification('stock_faible', 'Stock faible', `Le stock du produit "${p.nom}" est faible. Stock: ${p.stock}`, `produit-${p.id}`);
      }
    }
  }

  const liste = notifications || [];
  const nombreNonLues = liste.filter((n) => !n.lue).length;

  return { notifications: liste, creerNotification, marquerLue, verifierAlertes, nombreNonLues };
}