// src/hooks/useSyncAuto.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { synchroniser } from '../services/syncEngine';

export function useSyncAuto() {
  const [enCours, setEnCours] = useState(false);
  const [dernierResultat, setDernierResultat] = useState(null);
  const verrou = useRef(false);

  const lancerSync = useCallback(async () => {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);

    const resultat = await synchroniser();

    setDernierResultat(resultat);
    setEnCours(false);
    verrou.current = false;
  }, []);

  useEffect(() => {
    function auRetourEnLigne() {
      lancerSync();
    }
    window.addEventListener('online', auRetourEnLigne);
    if (navigator.onLine) lancerSync();

    const intervalle = setInterval(() => {
      if (navigator.onLine) lancerSync();
    }, 2 * 60 * 1000);

    return () => {
      window.removeEventListener('online', auRetourEnLigne);
      clearInterval(intervalle);
    };
  }, [lancerSync]);

  return { enCours, dernierResultat, lancerSync };
}