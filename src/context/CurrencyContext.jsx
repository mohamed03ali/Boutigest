import { CurrencyContext } from './currencyContextValue';
import { useBoutique } from '../services/useBoutique';

const DEVISES_CONFIG = {
  'CFA - Franc CFA': { code: 'XOF', suffixe: 'FCFA' },
  'EUR - Euro': { code: 'EUR', suffixe: '€' },
  'USD - Dollar': { code: 'USD', suffixe: '$' },
};

export function CurrencyProvider({ children }) {
  const { boutique } = useBoutique();
  const config = DEVISES_CONFIG[boutique?.devise] || DEVISES_CONFIG['CFA - Franc CFA'];

  function formatMontant(valeur) {
    const arrondi = Math.round(valeur || 0);
    return `${new Intl.NumberFormat('fr-FR').format(arrondi)} ${config.suffixe}`;
  }

  return (
    <CurrencyContext.Provider value={{ devise: boutique?.devise, formatMontant }}>
      {children}
    </CurrencyContext.Provider>
  );
}

