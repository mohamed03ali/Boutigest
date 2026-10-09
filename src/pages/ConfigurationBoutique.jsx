import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { getSyncToken } from '../services/syncAuth';
import { useAuth } from '../services/useAuth';

const API_URL = 'http://localhost:3000';

const TYPES_COMMERCE = [
  'Épicerie',
  'Boutique de vêtements',
  'Quincaillerie',
  'Pharmacie',
  'Boulangerie / Pâtisserie',
  'Boucherie',
  'Poissonnerie',
  'Vente de céréales et vivres',
  'Dépôt de boissons',
  'Restaurant / Gargote',
  'Cybercafé',
  'Vente de téléphones et accessoires',
  'Salon de coiffure / Esthétique',
  'Atelier de couture',
  'Cordonnerie',
  'Garage / Mécanique auto-moto',
  'Vente de pièces détachées',
  'Matériaux de construction',
  'Électroménager',
  'Bijouterie',
  'Librairie / Papeterie',
  'Station-service',
  'Agence de transport / voyage',
  'Autre',
];
const DEVISES = ['CFA - Franc CFA', 'EUR - Euro', 'USD - Dollar'];

export default function ConfigurationBoutique() {
  const navigate = useNavigate();
  const { ouvrirSession } = useAuth();
  const [form, setForm] = useState({
    nom: 'Ma Boutique',
    typeCommerce: 'Épicerie',
    devise: 'CFA - Franc CFA',
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const token = getSyncToken();
      const maintenant = new Date().toISOString();
      let idBoutique;

      // Le réseau est optionnel : toute erreur ici ne doit jamais empêcher
      // la création locale de la boutique (app offline-first).
      if (navigator.onLine && token) {
        try {
          const reponse = await fetch(`${API_URL}/boutiques`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          });
          if (reponse.ok) {
            const donnees = await reponse.json();
            idBoutique = donnees.id;
          }
        } catch (err) {
          console.error('Création boutique serveur impossible, repli local:', err);
        }
      }

      // Pas d'id serveur (hors ligne, token absent, ou échec réseau) → id local
      if (!idBoutique) idBoutique = crypto.randomUUID();

      // IMPORTANT : on utilise idBoutique (celui du serveur si dispo) comme id
      // local, pour que la boutique locale et le boutiqueId de l'utilisateur
      // pointent vers la MÊME ligne — sinon useBoutique() ne la retrouve jamais.
      await db.boutiques.add({
        id: idBoutique,
        ...form,
        utilisateurId: user.id,
        updatedAt: maintenant,
        deleted: false,
      });

      await db.utilisateurs.update(user.id, { boutiqueId: idBoutique, updatedAt: maintenant });

      const utilisateurMisAJour = { ...user, boutiqueId: idBoutique };
      localStorage.setItem('currentUser', JSON.stringify(utilisateurMisAJour));
      // Met à jour le contexte React EN MÉMOIRE, pas seulement localStorage —
      // sinon le reste de l'app (useBoutique, Sidebar, etc.) garde l'ancien
      // user jusqu'au prochain rechargement complet.
      ouvrirSession(utilisateurMisAJour);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErreur(err.message || 'Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 text-2xl">
          🏪
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Configuration de votre boutique</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Informations de votre commerce</p>

        {erreur && (
          <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block">
            <span className="text-sm text-gray-700">Nom de la boutique</span>
            <input
              name="nom" value={form.nom} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Type de commerce</span>
            <select
              name="typeCommerce"
              value={form.typeCommerce}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {TYPES_COMMERCE.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Devise</span>
            <select
              name="devise" value={form.devise} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {DEVISES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {chargement ? 'Enregistrement...' : 'Enregistrer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}