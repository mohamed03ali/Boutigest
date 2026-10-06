import { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../db/db';
import bcrypt from 'bcryptjs';
import { setSyncToken } from './syncAuth';
import { synchroniser } from './syncEngine';

const API_URL = 'http://localhost:3000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [initialisationEnCours, setInitialisationEnCours] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role) return;

    let actif = true;
    db.utilisateurs.get(user.id).then((utilisateurLocal) => {
      if (!actif || !utilisateurLocal?.role) return;
      setUser(utilisateurLocal);
      localStorage.setItem('currentUser', JSON.stringify(utilisateurLocal));
    }).catch((err) => {
      if (actif) console.error('Erreur chargement du rôle utilisateur:', err);
    });

    return () => {
      actif = false;
    };
  }, [user]);

  async function login(identifiant, motDePasse) {
    const utilisateurLocal = await db.utilisateurs
      .where('email').equals(identifiant)
      .or('telephone').equals(identifiant)
      .filter((u) => !u.deleted)
      .first();

    if (utilisateurLocal) {
      const valide = await bcrypt.compare(motDePasse, utilisateurLocal.motDePasse);
      if (!valide) return false;
      setUser(utilisateurLocal);
      localStorage.setItem('currentUser', JSON.stringify(utilisateurLocal));
      return true;
    }

    if (!navigator.onLine) return false;
    return await tenterConnexionNouvelAppareil(identifiant, motDePasse);
  }

  function ouvrirSession(utilisateur) {
    setUser(utilisateur);
    localStorage.setItem('currentUser', JSON.stringify(utilisateur));
  }

  async function tenterConnexionNouvelAppareil(identifiant, motDePasse) {
    setInitialisationEnCours(true);
    try {
      const reponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: identifiant, motDePasse }),
      });
      if (!reponse.ok) return false;

      const donnees = await reponse.json();
      setSyncToken(donnees.token);

      const motDePasseHacheLocal = await bcrypt.hash(motDePasse, 10);
      const maintenant = new Date().toISOString();
      const nouvelUtilisateur = {
        id: donnees.id,
        nom: donnees.nom,
        telephone: donnees.telephone,
        email: donnees.email || null,
        motDePasse: motDePasseHacheLocal,
        role: donnees.role,
        updatedAt: maintenant,
        deleted: false,
      };
      await db.utilisateurs.add(nouvelUtilisateur);

      setUser(nouvelUtilisateur);
      localStorage.setItem('currentUser', JSON.stringify(nouvelUtilisateur));

      await synchroniser();

      return true;
    } catch (err) {
      console.error('Erreur initialisation nouvel appareil:', err);
      return false;
    } finally {
      setInitialisationEnCours(false);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('currentUser');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ouvrirSession, initialisationEnCours }}>
      {children}
    </AuthContext.Provider>
  );
}