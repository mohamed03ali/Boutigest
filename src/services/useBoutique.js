// hooks/useBoutique.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useBoutique() {
  const boutique = useLiveQuery(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.boutiqueId) return null;
    return db.boutiques.get(user.boutiqueId);
  }, []);

  async function modifierBoutique(donnees) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.boutiqueId) return;
    await db.boutiques.update(user.boutiqueId, { ...donnees, updatedAt: new Date().toISOString() });
  }

  return { boutique: boutique || null, modifierBoutique };
}