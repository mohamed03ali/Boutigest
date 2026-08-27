import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs'
import { db } from '../db/db';

export default function CreerCompte() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nomComplet: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse:'',
  });
  const [affichermdp,setAffichermdp] = useState('')
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!form.nomComplet || !form.telephone || !form.motDePasse) {
      setErreur('Nom, téléphone et mot de passe sont obligatoires.');
      return;
    }
    if (form.motDePasse.length < 6) {
      setErreur('le mot depasse doit contenir au moins 6  caracteres.')
    }
     if (form.motDePasse !== form.confirmMotDePasse) {
        setErreur('le mot de passe ne correspond pas')
      } 

    setChargement(true);
    try {
      // Vérifier qu'un compte n'existe pas déjà avec ce téléphone
      const existant = await db.utilisateurs
        .where('telephone').equals(form.telephone).first();
      if (existant) {
        setErreur('Un compte existe déjà avec ce numéro.');
        return;
      }
     
     
       const motDepasseHache = await bcrypt.hash(form.motDePasse,10)

      const id = await db.utilisateurs.add({
        nom: form.nomComplet,
        telephone: form.telephone,
        email: form.email || null,
        motDePasse: motDepasseHache,
        role: 'admin', // le créateur du compte est admin de sa boutique
      });

      localStorage.setItem('currentUser', JSON.stringify({ id, ...form }));
      navigate('/configuration-boutique');
    } catch (err) {
        console.error(err) 
      setErreur("Une erreur est survenue, réessaie." );
    } finally {
      setChargement(false);
    }
  }

 return (
  <div className="min-h-screen flex items-center justify-center bg-surface px-4">
    <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-xl font-semibold text-gray-900">Créer un compte</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Remplissez les informations ci-dessous
      </p>

      {erreur && (
        <div className="bg-red-50 text-alert-600 text-sm rounded-lg px-3 py-2 mb-4">
          {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-700">Nom complet</span>
          <input
            name="nomComplet"
            value={form.nomComplet}
            onChange={handleChange}
            placeholder="Entrez votre nom"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Telephone</span>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            placeholder="Entrez votre numero"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Email(optionnel)</span>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Entrez votre mail"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Mot de passe</span>
          <input
            type={affichermdp ? 'text':'password'}
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
            placeholder="Entrez votre mot de passe"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Mot de passe de confirmation</span>
          <input
             type={affichermdp ? 'text':'password'}
            name="confirmMotDePasse"
            value={form.confirmMotDePasse}
            onChange={handleChange}
            placeholder="Entrez votre mot de passe"
            className={`mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${form.confirmMotDePasse && form.motDePasse !== form.confirmMotDePasse ? 'border-alert-600':'border-gray-300 focus:border-brand-600'}`}
          />{form.confirmMotDePasse && form.motDePasse !== form.confirmMotDePasse &&(<p className='text-xs text-alert-600 mt-1'>Les mots de passe ne correspondent pas</p>)}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">

          <input
             type='checkbox'
             checked={affichermdp}
            onChange={(e)=>setAffichermdp(e.target.checked)}
            className=" rounded border-gray-300 text-brand-600
                        focus:ring-brand-600"
          />
          Afficher le mot de passe
        </label>

        {/* ... même pattern pour téléphone, email, mot de passe ... */}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium
                     hover:bg-brand-900 transition-colors disabled:opacity-50"
        >
          {chargement ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        Déjà un compte ?{' '}
        <Link to="/connexion" className="text-brand-600 font-medium">Se connecter</Link>
      </p>
    </div>
  </div>
);


  
}
