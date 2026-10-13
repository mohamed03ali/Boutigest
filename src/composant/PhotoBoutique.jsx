import { useRef } from 'react';
import { Camera, Store } from 'lucide-react';
import { db } from '../db/db';

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo en entrée (avant compression) — on reste tolérant côté sélection
const LARGEUR_MAX = 400; // px — largement suffisant pour un logo/photo de boutique
const QUALITE_JPEG = 0.7;

export default function PhotoBoutique({ boutique, onChangement }) {
  const inputRef = useRef(null);

  function compresserImage(fichier) {
    return new Promise((resolve, reject) => {
      const lecteur = new FileReader();
      lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'));
      lecteur.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Image invalide.'));
        img.onload = () => {
          const ratio = Math.min(1, LARGEUR_MAX / img.width);
          const largeur = Math.round(img.width * ratio);
          const hauteur = Math.round(img.height * ratio);

          const canvas = document.createElement('canvas');
          canvas.width = largeur;
          canvas.height = hauteur;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, largeur, hauteur);

          // JPEG : beaucoup plus léger que le PNG d'origine pour une photo
          resolve(canvas.toDataURL('image/jpeg', QUALITE_JPEG));
        };
        img.src = lecteur.result;
      };
      lecteur.readAsDataURL(fichier);
    });
  }

  async function handleFichier(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    if (!boutique?.id) {
      alert('Boutique en cours de chargement, réessaie dans un instant.');
      return;
    }

    if (fichier.size > TAILLE_MAX) {
      alert('La photo doit faire moins de 5 Mo.');
      return;
    }

    try {
      const photoCompressee = await compresserImage(fichier);
      await db.boutiques.update(boutique.id, {
        photoBoutique: photoCompressee,
        updatedAt: new Date().toISOString(),
      });
      onChangement?.();
    } catch (err) {
      console.error(err);
      alert("Impossible de traiter cette photo, réessaie avec une autre image.");
    } finally {
      // Permet de resélectionner le même fichier une seconde fois si besoin
      e.target.value = '';
    }
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

