import { Navigate } from "react-router-dom";
import { useAuth } from "../services/useAuth";

function ProtectedRoute({ children }) {
  const { user, initialisationEnCours, roleEnCours } = useAuth();

  if (initialisationEnCours || roleEnCours) {
    return <p>Chargement de Boutigest...</p>;
  }
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

export default ProtectedRoute;