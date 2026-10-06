import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useNotifications() {
  const notifications = useLiveQuery(
    () => db.notifications.orderBy('date').reverse().filter((n) => !n.deleted).limit(20).toArray(),
    []
  );

  async function creerNotification(type, titre, message, referenceId = null) {
    const maintenant = new Date().toISOString();
    await db.notifications.add({
      id: crypto.randomUUID(), type, titre, message, referenceId,
      date: maintenant, lue: false, updatedAt: maintenant, deleted: false,
    });
  }

  async function marquerLue(id) {
    await db.notifications.update(id, { lue: true, updatedAt: new Date().toISOString() });
  }

  async function verifierAlertes() {
    const produits = await db.produits.filter((p) => !p.deleted).toArray();
    const faibles = produits.filter((p) => p.stock > 0 && p.stock <= (p.seuilReappro || 10));

    for (const p of faibles) {
      const dejaExiste = await db.notifications
        .where('referenceId').equals(`produit-${p.id}`)
        .and((n) => n.type === 'stock_faible' && !n.deleted)
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