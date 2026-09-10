export default function StatCard({ label, value, accent }) {
  const styles = {
    green: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'text-emerald-700' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'text-blue-700' },
    purple: { bg: 'bg-violet-100', text: 'text-violet-800', label: 'text-violet-700' },
    orange: { bg: 'bg-amber-50', text: 'text-amber-800', label: 'text-amber-700' },
  };
  const s = styles[accent] || styles.green;

  return (
    <div className={`rounded-xl p-4 ${s.bg}`}>
      <p className={`text-xs font-medium ${s.label}`}>{label}</p>
      <p className={`text-xl font-semibold mt-1 ${s.text}`}>{value}</p>
    </div>
  );
}

 