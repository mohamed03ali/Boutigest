import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Eye, EyeOff } from 'lucide-react';
import { db } from '../db/db';
import { getSyncToken } from '../services/syncAuth';

const API_URL = 'http://localhost:3000';

export default function MotDePasseOublie() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); // 1: téléphone, 2: question, 3: nouveau mdp
  const [telephone, setTelephone] = useState('');
  const [utilisateur, setUtilisateur] = useState(null);
  const [reponse, setReponse] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmNouveauMdp, setConfirmNouveauMdp] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function handleEtape1(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const u = await db.utilisateurs
        .where('telephone').equals(telephone).filter((x) => !x.deleted).first();
      if (!u) {
        setErreur('Aucun compte trouvé avec ce numéro sur cet appareil.');
        return;
      }
      if (!u.questionSecurite) {
        setErreur('Ce compte n\'a pas de question de sécurité configurée. Contactez le support.');
        return;
      }
      setUtilisateur(u);
      setEtape(2);
    } finally {
      setChargement(false);
    }
  }

  async function handleEtape2(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const valide = await bcrypt.compare(
        reponse.toLowerCase().trim(),
        utilisateur.reponseSecurite
      );
      if (!valide) {
        setErreur('Réponse incorrecte.');
        return;
      }
      setEtape(3);
    } finally {
      setChargement(false);
    }
  }

  async function handleEtape3(e) {
    e.preventDefault();
    setErreur('');

    if (nouveauMdp.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (nouveauMdp !== confirmNouveauMdp) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);
    try {
      const nouveauHache = await bcrypt.hash(nouveauMdp, 10);
      const maintenant = new Date().toISOString();

      // 1. Mise à jour locale — fonctionne toujours, même hors ligne
      await db.utilisateurs.update(utilisateur.id, {
        motDePasse: nouveauHache,
        updatedAt: maintenant,
      });

      // 2. Tentative serveur en tâche de fond, si réseau disponible
      if (navigator.onLine) {
        const token = getSyncToken();
        if (token) {
          fetch(`${API_URL}/utilisateurs/${utilisateur.id}/mot-de-passe`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ motDePasse: nouveauMdp }),
          }).catch(() => {});
        }
      }

      navigate('/connexion');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-900">Mot de passe oublié ?</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          {etape === 1 && 'Entrez votre numéro de téléphone.'}
          {etape === 2 && 'Répondez à votre question de sécurité.'}
          {etape === 3 && 'Définissez un nouveau mot de passe.'}
        </p>

        {erreur && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">{erreur}</div>
        )}

        {etape === 1 && (
          <form onSubmit={handleEtape1} className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Téléphone</span>
              <input
                value={telephone} onChange={(e) => setTelephone(e.target.value)}
                placeholder="6 99 99 99 99"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
              />
            </label>
            <button type="submit" disabled={chargement}
              className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
              {chargement ? 'Recherche...' : 'Continuer'}
            </button>
          </form>
        )}

        {etape === 2 && (
          <form onSubmit={handleEtape2} className="space-y-4">
            <p className="text-sm font-medium text-gray-900">{utilisateur.questionSecurite}</p>
            <label className="block">
              <span className="text-sm text-gray-700">Votre réponse</span>
              <input
                value={reponse} onChange={(e) => setReponse(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
              />
            </label>
            <button type="submit" disabled={chargement}
              className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
              {chargement ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>
        )}

        {etape === 3 && (
          <form onSubmit={handleEtape3} className="space-y-4">
            <label className="block relative">
              <span className="text-sm text-gray-700">Nouveau mot de passe</span>
              <input
                type={afficherMdp ? 'text' : 'password'}
                value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
              />
              <button type="button" onClick={() => setAfficherMdp((v) => !v)}
                className="absolute right-3 top-8 text-gray-400">
                {afficherMdp ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Confirmer le mot de passe</span>
              <input
                type={afficherMdp ? 'text' : 'password'}
                value={confirmNouveauMdp} onChange={(e) => setConfirmNouveauMdp(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
              />
            </label>

            <button type="submit" disabled={chargement}
              className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
              {chargement ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 text-center mt-4">
          <Link to="/connexion" className="text-brand-600 font-medium">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}