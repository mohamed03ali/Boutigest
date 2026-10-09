import { useLiveQuery } from 'dexie-react-hooks';
import bcrypt from 'bcryptjs';
import { db } from '../db/db';
import { useAuth } from './useAuth';

export function useUtilisateurs() {
  const { user } = useAuth();
  const boutiqueId = user?.boutiqueId;

  const utilisateurs = useLiveQuery(async () => {
    if (!boutiqueId) return [];
    const liste = await db.utilisateurs.where('boutiqueId').equals(boutiqueId).and((u) => !u.deleted).toArray();
    return liste.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [boutiqueId]);

  async function ajouterUtilisateur({ nom, telephone, email, motDePasse, role }) {
    if (!boutiqueId) return;
    const existant = await db.utilisateurs.where('telephone').equals(telephone).filter((u) => !u.deleted).first();
    if (existant) throw new Error('Un compte existe déjà avec ce numéro.');

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);
    const maintenant = new Date().toISOString();
    await db.utilisateurs.add({
      id: crypto.randomUUID(),
      nom, telephone, email: email || null, motDePasse: motDePasseHache, role,
      boutiqueId,
      updatedAt: maintenant, deleted: false,
    });
  }

  async function supprimerUtilisateur(id) {
    await db.utilisateurs.update(id, { deleted: true, updatedAt: new Date().toISOString() });
  }

  return { utilisateurs: utilisateurs || [], ajouterUtilisateur, supprimerUtilisateur };
}