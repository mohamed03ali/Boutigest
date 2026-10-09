import { useAuth } from './useAuth';
import { aAcces } from '../data/permissions';

export function usePermissions() {
  const { user, roleEnCours } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    chargementRole: roleEnCours,
    peutAcceder: (module) => (role ? aAcces(role, module) : false),
  };
}