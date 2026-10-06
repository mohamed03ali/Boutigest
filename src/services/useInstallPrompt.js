import { useState, useEffect, useCallback } from 'react';

export function useInstallPrompt() {
  const [evenementInstallation, setEvenementInstallation] = useState(null);
  const [estInstallable, setEstInstallable] = useState(false);
  const [estInstallee, setEstInstallee] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    function capter(e) {
      e.preventDefault(); // empêche la bannière automatique du navigateur
      setEvenementInstallation(e);
      setEstInstallable(true);
    }

    function appInstallee() {
      setEstInstallee(true);
      setEstInstallable(false);
    }

    window.addEventListener('beforeinstallprompt', capter);
    window.addEventListener('appinstalled', appInstallee);
    return () => {
      window.removeEventListener('beforeinstallprompt', capter);
      window.removeEventListener('appinstalled', appInstallee);
    };
  }, []);

  const installer = useCallback(async () => {
    if (!evenementInstallation) return null;
    evenementInstallation.prompt();
    const resultat = await evenementInstallation.userChoice; // { outcome: 'accepted' | 'dismissed' }
    setEvenementInstallation(null);
    setEstInstallable(false);
    return resultat.outcome;
  }, [evenementInstallation]);

  return { estInstallable, estInstallee, installer };
}