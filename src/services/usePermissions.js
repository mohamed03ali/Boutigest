import { useAuth } from '../services/useAuth';
import { aAcces } from '../data/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || 'vendeur';

  return {
    role,
    peutAcceder: (module) => aAcces(role, module),
  };
}