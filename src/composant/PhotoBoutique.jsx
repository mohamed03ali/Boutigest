import { useRef } from 'react';
import { Camera, Store } from 'lucide-react';
import { db } from '../db/db';

const TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo

export default function PhotoBoutique({ boutique, onChangement }) {
  const inputRef = useRef(null);

  function handleFichier(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    if (fichier.size > TAILLE_MAX) {
      alert('La photo doit faire moins de 2 Mo.');
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = async () => {
      await db.boutiques.update(boutique?.id, {
        photoBoutique: lecteur.result, // base64
        updatedAt: new Date().toISOString(),
      });
      onChangement?.();
    };
    lecteur.readAsDataURL(fichier);
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="relative w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center overflow-hidden shrink-0"
    >
      {boutique?.photoBoutique ? (
        <img src={boutique.photoBoutique} alt={boutique.nom} className="w-full h-full object-cover" />
      ) : (
        <Store size={26} className="text-brand-600" />
      )}
      <span className="absolute bottom-0 right-0 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
        <Camera size={14} className="text-white" />
      </span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFichier} className="hidden" />
    </button>
  );
}