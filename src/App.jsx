 

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/useAuth';
import { usePermissions } from './services/usePermissions';
import Connexion from './pages/Connexion';
import CreerCompte from './pages/CreerCompte';
import ConfigurationBoutique from './pages/ConfigurationBoutique';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './composant/DashboardLayout';
import Ventes from './pages/Ventes';
import Produits from './pages/Produits';
import Stock from './pages/Stock';
import Clients from './pages/Clients';
import Dettes from './pages/Dettes';
import Depenses from './pages/Depenses';
import Rapports from './pages/Rapports';
import Zakat from './pages/Zakat';
import HistoriqueZakat from './pages/HistoriqueZakat';
import Utilisateurs from './pages/Utilisateurs';
import Notifications from './pages/Notifications';
import Parametres from './pages/Parametres'
import ActiviteComplete from './pages/ActiviteComplete';
import MotDePasseOublie from './pages/MotDePasseOublie';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" />;
}


function RequireRole({ module, children }) {
  const { peutAcceder } = usePermissions();
  return peutAcceder(module) ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/creer-compte" element={<CreerCompte />} />
      <Route
        path="/configuration-boutique"
        element={<PrivateRoute><ConfigurationBoutique /></PrivateRoute>}
      />
      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/ventes" element={<Ventes />} />
  <Route path="/produits" element={<RequireRole module="produits"><Produits /></RequireRole>} />
  <Route path="/stock" element={<RequireRole module="stock"><Stock /></RequireRole>} />
  <Route path="/clients" element={<Clients />} />
  <Route path="/dettes" element={<Dettes />} />
  <Route path="/depenses" element={<RequireRole module="depenses"><Depenses /></RequireRole>} />
  <Route path="/rapports" element={<RequireRole module="rapports"><Rapports /></RequireRole>} />
  <Route path="/zakat" element={<RequireRole module="zakat"><Zakat /></RequireRole>} />
  <Route path="/zakat/historique" element={<RequireRole module="zakat"><HistoriqueZakat /></RequireRole>} />
  <Route path="/utilisateurs" element={<RequireRole module="utilisateurs"><Utilisateurs /></RequireRole>} />
  <Route path="/parametres" element={<RequireRole module="parametres"><Parametres /></RequireRole>} />
  <Route path="/notifications" element={<Notifications />} />
  <Route path="/activite" element={<ActiviteComplete />} />
  
</Route>
      <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
      <Route path="*" element={<Navigate to="/connexion" />} />
    </Routes>
  );
}
