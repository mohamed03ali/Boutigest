import { useLiveQuery } from 'dexie-react-hooks';
import bcrypt from 'bcryptjs';
import { db } from '../db/db';

export function useUtilisateurs() {
  const utilisateurs = useLiveQuery(
    () => db.utilisateurs.orderBy('nom').filter((u) => !u.deleted).toArray(),
    []
  );

  async function ajouterUtilisateur({ nom, telephone, email, motDePasse, role }) {
    const utilisateurCourant = JSON.parse(localStorage.getItem('currentUser'));
    const existant = await db.utilisateurs.where('telephone').equals(telephone).filter((u) => !u.deleted).first();
    if (existant) throw new Error('Un compte existe déjà avec ce numéro.');

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);
    const maintenant = new Date().toISOString();
    await db.utilisateurs.add({
      id: crypto.randomUUID(),
      nom, telephone, email: email || null, motDePasse: motDePasseHache, role,
      boutiqueId: utilisateurCourant?.boutiqueId || null,
      updatedAt: maintenant, deleted: false,
    });
  }

  async function supprimerUtilisateur(id) {
    await db.utilisateurs.update(id, { deleted: true, updatedAt: new Date().toISOString() });
  }

  return { utilisateurs: utilisateurs || [], ajouterUtilisateur, supprimerUtilisateur };
}