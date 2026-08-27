export default function StatCard({ label, value, sublabel, trend, trendUp, accent }) {
  const styles = {
    green: { bg: 'bg-gradient-to-br from-emerald-50 to-green-100', text: 'text-emerald-700', label: 'text-emerald-600' },
    blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', text: 'text-blue-700', label: 'text-blue-600' },
    purple: { bg: 'bg-gradient-to-br from-violet-50 to-purple-100', text: 'text-violet-700', label: 'text-violet-600' },
    orange: { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', text: 'text-orange-700', label: 'text-orange-600' },
  };
  const s = styles[accent] || styles.green;

  return (
    <div className={`rounded-xl p-5 ${s.bg}`}>
      <p className={`text-xs font-medium ${s.label}`}>{label}</p>
      <p className={`text-xl font-bold mt-1 ${s.text}`}>{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trendUp ? s.label : 'text-alert-600'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </p>
      )}
      {sublabel && !trend && <p className={`text-xs mt-1 ${s.label}`}>{sublabel}</p>}
    </div>
  );
}

