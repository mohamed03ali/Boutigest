import { useContext } from 'react';
import { CurrencyContext } from './currencyContextValue';

export function useCurrency() {
  return useContext(CurrencyContext);
}