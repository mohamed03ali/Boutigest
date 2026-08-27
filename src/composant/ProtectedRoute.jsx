import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute ({children,}){
    const {utilisateur,chargement,} = useAuth();
    if (chargement) {
        return (
            <p>Chargement de Boutigest...</p>
        )
    }
    if (!utilisateur) {
        return (<Navigate to="/connexion" replace />)
    }
    return children
}
export default ProtectedRoute