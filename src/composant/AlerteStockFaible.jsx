export default function AlerteStockFaible({ produits }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Alerte stock faible</h3>
        <a href="/stock" className="text-xs text-brand-600 font-medium">Voir tout</a>
      </div>
      <div className="space-y-3">
        {produits.length === 0 && (
          <p className="text-sm text-gray-400">Aucune alerte, stock ok.</p>
        )}
        {produits.map((p) => {
          const pourcentage = Math.min(100, (p.stock / p.seuilReappro) * 100);
          return (
            <div key={p.id} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-900">{p.nom}</p>
              <p className="text-xs text-gray-500 mb-2">SKU : {p.sku || `PRD-${p.id}`}</p>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-alert-600 font-medium">Stock : {p.stock}</span>
                <span className="text-gray-400">Réappro. : {p.seuilReappro}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-alert-600" style={{ width: `${pourcentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

