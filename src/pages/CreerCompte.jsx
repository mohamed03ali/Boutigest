import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { db } from '../db/db';
import { setSyncToken } from '../services/syncAuth';
import { useAuth } from '../services/useAuth';

const API_URL =  'http://localhost:3000' ; 

const QUESTIONS_SECURITE = [
  'Quel est le nom de votre pays ?',
  'Quel est le nom de votre ville natale ?',
  'Quel est le surnom de votre mère ?',
  'Quel est le nom de votre premier commerce ?',
  'Quel est le plat que vous préférez ?',
];

export default function CreerCompte() {
  const navigate = useNavigate();
  const { ouvrirSession } = useAuth();

  const [form, setForm] = useState({
    nom: '',
    identifiant: '', // email ou téléphone
    motDePasse: '',
    confirmMotDePasse: '',
    questionSecurite: QUESTIONS_SECURITE[0],
    reponseSecurite: '',
  });

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    // 1. Validations locales, avant tout appel réseau
    if (form.motDePasse !== form.confirmMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!form.reponseSecurite.trim()) {
      setErreur('La réponse de sécurité est obligatoire pour récupérer ton compte plus tard.');
      return;
    }

    // 2. La création de compte exige une connexion (Option A) :
    //    un compte doit toujours exister sur le serveur pour pouvoir
    //    être retrouvé depuis un autre appareil plus tard.
    if (!navigator.onLine) {
      setErreur('Une connexion internet est nécessaire pour créer votre compte.');
      return;
    }

    setChargement(true);
    try {
      const reponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          identifiant: form.identifiant,
          motDePasse: form.motDePasse,
          questionSecurite: form.questionSecurite,
          reponseSecurite: form.reponseSecurite, // hachée côté serveur
        }),
      });

      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        throw new Error(data.erreur || 'Impossible de créer le compte.');
      }

      const donneesServeur = await reponse.json(); // { id, token, ... }

      // 3. On ne hache la réponse de sécurité et le mot de passe
      //    localement QU'APRÈS la confirmation du serveur, pour
      //    garantir que l'id local == id serveur dès la création.
      const motDePasseHache = await bcrypt.hash(form.motDePasse, 10);
      const reponseSecuriteHachee = await bcrypt.hash(
        form.reponseSecurite.toLowerCase().trim(),
        10
      );

      const utilisateurLocal = {
        id: donneesServeur.id,
        nom: form.nom,
        email: form.identifiant.includes('@') ? form.identifiant : '',
        telephone: !form.identifiant.includes('@') ? form.identifiant : '',
        motDePasse: motDePasseHache,
        questionSecurite: form.questionSecurite,
        reponseSecurite: reponseSecuriteHachee,
        role: donneesServeur.role || 'admin',
        boutiqueId: null, // renseigné à l'étape de configuration de la boutique
        updatedAt: new Date().toISOString(),
        deleted: false,
      };
      await db.utilisateurs.add(utilisateurLocal);

      setSyncToken(donneesServeur.token);
      ouvrirSession(utilisateurLocal);

      navigate('/configuration-boutique');
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue pendant la création du compte.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-[var(--shadow-card)]"
      >
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Créer un compte</h1>
        <p className="text-sm text-gray-500 mb-6">Pour gérer votre boutique avec Boutigest.</p>

        {erreur && (
          <div className="mb-4 text-sm text-alert-600 bg-red-50 rounded-xl px-3 py-2">
            {erreur}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-4 text-sm"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Email ou téléphone</label>
        <input
          name="identifiant"
          value={form.identifiant}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-4 text-sm"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <div className="relative mb-4">
          <input
            type={afficherMotDePasse ? 'text' : 'password'}
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setAfficherMotDePasse((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {afficherMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
        <div className="relative mb-4">
          <input
            type={afficherConfirmation ? 'text' : 'password'}
            name="confirmMotDePasse"
            value={form.confirmMotDePasse}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setAfficherConfirmation((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {afficherConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Question de sécurité</label>
        <select
          name="questionSecurite"
          value={form.questionSecurite}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-4 text-sm bg-white"
        >
          {QUESTIONS_SECURITE.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Réponse</label>
        <input
          name="reponseSecurite"
          value={form.reponseSecurite}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-6 text-sm"
        />
        <p className="text-xs text-gray-400 mb-4">
          Cette réponse te permettra de récupérer ton compte si tu oublies ton mot de passe.
        </p>

        <button
          type="submit"
          disabled={chargement}
          className="w-full rounded-xl bg-brand-600 text-white py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {chargement && <Loader2 size={16} className="animate-spin" />}
          {chargement ? 'Création en cours...' : 'Créer mon compte'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ? <Link to="/connexion" className="text-brand-600 font-medium">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}