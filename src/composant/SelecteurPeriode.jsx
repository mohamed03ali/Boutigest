const PERIODES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Mois' },
  { key: 'tout', label: 'Tout' },
];

export default function SelecteurPeriode({ valeur, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PERIODES.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`flex-none px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
            valeur === p.key
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'bg-transparent border-gray-200 text-gray-500'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}