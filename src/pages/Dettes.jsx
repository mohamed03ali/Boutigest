import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useDettes } from '../services/useDettes';
import ConfirmModal from '../composant/ui/ConfirmModal';

export default function Dettes() {
  const { dettes, reglerDette } = useDettes();
  const [detteAConfirmer, setDetteAConfirmer] = useState(null);

  const dettesEnAttente = dettes.filter((d) => d.statut === 'retard');
  const totalDettes = dettesEnAttente.reduce((somme, d) => somme + d.montant, 0);

  async function confirmerReglement() {
    await reglerDette(detteAConfirmer?.id);
    setDetteAConfirmer(null);
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Dettes clients</h1>

      <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-gray-500">Total en attente</p>
        <p className="text-2xl font-semibold text-alert-600">{totalDettes.toLocaleString('fr-FR')} FCFA</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] divide-y divide-gray-100">
        {dettesEnAttente.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune dette en attente.</p>}
        {dettesEnAttente.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.nomClient}</p>
              {d.telephoneClient && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone size={11} /> {d.telephoneClient}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{d.montant.toLocaleString('fr-FR')} FCFA</span>
              <button onClick={() => setDetteAConfirmer(d)} className="rounded-xl bg-brand-100 text-brand-600 px-3 py-1.5 text-xs font-medium">
                Marquer réglée
              </button>
            </div>
          </div>
        ))}
      </div>

      {detteAConfirmer && (
        <ConfirmModal
          titre="Marquer cette dette comme réglée ?"
          message={`${detteAConfirmer.nomClient} — ${detteAConfirmer.montant.toLocaleString('fr-FR')} FCFA. L'encaissement sera mis à jour.`}
          labelConfirmer="Confirmer le règlement"
          variant="brand"
          onConfirmer={confirmerReglement}
          onAnnuler={() => setDetteAConfirmer(null)}
        />
      )}
    </div>
  );
}