import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../services/useAuth';

export default function Connexion() {
  const navigate = useNavigate();
  const { login, initialisationEnCours } = useAuth();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const succes = await login(identifiant, motDePasse);
      if (!succes) {
        setErreur('Identifiants incorrects, ou connexion internet requise pour un nouvel appareil.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setErreur('Une erreur est survenue, réessaie.',err);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-900">Bienvenue !</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Connectez-vous à votre compte
        </p>

        {erreur && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Email ou téléphone</span>
            <input
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="téléphone ou email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </label>

          <label className="block relative">
            <span className="text-sm text-gray-700">Mot de passe</span>
            <input
              type={afficherMdp ? 'text' : 'password'}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
            <button
              type="button"
              onClick={() => setAfficherMdp((v) => !v)}
              className="absolute right-3 top-8 text-gray-400"
            >
              {afficherMdp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          <Link to="/mot-de-passe-oublie" className="text-sm text-brand-600">
            Mot de passe oublié ?
          </Link>

          <button
            type="submit"
            disabled={chargement || initialisationEnCours}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium
                       hover:bg-brand-900 transition-colors disabled:opacity-50"
          >
            {initialisationEnCours ? 'Récupération de vos données...' : chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Pas encore de compte ? <Link to="/creer-compte" className="text-brand-600 font-medium">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}