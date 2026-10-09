// hooks/useBoutique.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../services/useAuth';

export function useBoutique() {
  const { user } = useAuth();

  const boutique = useLiveQuery(async () => {
    if (!user?.id) return null;
    // On relit l'utilisateur depuis Dexie (pas localStorage) : cette lecture
    // est trackée par useLiveQuery, donc un changement de boutiqueId
    // (bascule de boutique active) redéclenche automatiquement cette requête.
    const utilisateurLocal = await db.utilisateurs.get(user.id);
    if (!utilisateurLocal?.boutiqueId) return null;
    return db.boutiques.get(utilisateurLocal.boutiqueId);
  }, [user?.id]);

  async function modifierBoutique(donnees) {
    if (!user?.id) return;
    const utilisateurLocal = await db.utilisateurs.get(user.id);
    if (!utilisateurLocal?.boutiqueId) return;
    await db.boutiques.update(utilisateurLocal.boutiqueId, {
      ...donnees,
      updatedAt: new Date().toISOString(),
    });
  }

  return { boutique: boutique || null, modifierBoutique };
}