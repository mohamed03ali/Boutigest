import { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../db/db';
import bcrypt from 'bcryptjs';
import { getSyncToken, setSyncToken } from './syncAuth';
import { synchroniser } from './syncEngine';

const API_URL = 'http://localhost:3000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [initialisationEnCours, setInitialisationEnCours] = useState(false);
  const [roleEnCours, setRoleEnCours] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    const u = saved ? JSON.parse(saved) : null;
    return !!u?.id && (!u?.role || !u?.boutiqueId);
  });

  useEffect(() => {
    const incomplet = user?.id && (!user.role || !user.boutiqueId);
    if (!incomplet) {
      setRoleEnCours(false);
      return;
    }

    setRoleEnCours(true);
    let actif = true;

    (async () => {
      try {
        // 1. On essaie d'abord localement
        let utilisateurComplet = await db.utilisateurs.get(user.id);

        // 2. Rôle ou boutique manquant en local → appel réseau de secours
        if ((!utilisateurComplet?.role || !utilisateurComplet?.boutiqueId) && navigator.onLine) {
          const token = getSyncToken();
          if (token) {
            const reponse = await fetch(`${API_URL}/auth/moi`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (reponse.ok) {
              const donneesServeur = await reponse.json();
              utilisateurComplet = {
                ...user,
                ...utilisateurComplet,
                ...donneesServeur,
                updatedAt: new Date().toISOString(),
                deleted: false,
              };
              await db.utilisateurs.put(utilisateurComplet);
            }
          }
        }

        if (!actif) return;
        if (!utilisateurComplet?.role || !utilisateurComplet?.boutiqueId) {
          setRoleEnCours(false);
          return;
        }

        setUser(utilisateurComplet);
        localStorage.setItem('currentUser', JSON.stringify(utilisateurComplet));
        setRoleEnCours(false);
      } catch (err) {
        if (actif) {
          console.error('Erreur chargement du rôle/boutique utilisateur:', err);
          setRoleEnCours(false);
        }
      }
    })();

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
        boutiqueId: donnees.boutiqueId,
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
    <AuthContext.Provider
      value={{ user, login, logout, ouvrirSession, initialisationEnCours, roleEnCours }}
    >
      {children}
    </AuthContext.Provider>
  );
}