
/*import {useContext,createContext, useState } from 'react';
import { db } from '../db/db';
import bcrypt from 'bcryptjs';
const AuthContext = createContext(null)

export function AuthProvider({children}) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(identifiant, motDePasse) {
    const utilisateur = await db.utilisateurs
      .where('email').equals(identifiant)
      .or('telephone').equals(identifiant)
      .first();

      if (!utilisateur) return false
      const valide = await bcrypt.compare(motDePasse,utilisateur.motDePasse)
      if(!valide) return false
         setUser(utilisateur);
      localStorage.setItem('currentUser', JSON.stringify(utilisateur));
      return true;}
      
  function logout() {
    setUser(null);
    localStorage.removeItem('currentUser');
  }

  return ( 
    <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>
  )

  }
  export function useAuth(){
    return useContext(AuthContext)
  }*/
 import { useState} from 'react';
import { db } from '../db/db';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, motDePasse) {
    const utilisateur = await db.utilisateurs
      .where('email').equals(email).first();
    if (utilisateur && utilisateur.motDePasse === motDePasse) {
      setUser(utilisateur);
      localStorage.setItem('currentUser', JSON.stringify(utilisateur));
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('currentUser');
  }

  return { user, login, logout };
}
