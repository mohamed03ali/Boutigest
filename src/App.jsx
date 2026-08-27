

/*import { Routes,Route,Navigate} from "react-router-dom"

  


import  "./App.css"

function App() {
/* 
import Dashbord from "./pages/Dashbord"
import Ventes from "./pages/Ventes"
import Stock from "./pages/Stock"
import {FaEdit,FaTrash,FaShoppingCart,FaBox,FaUser,FaChartBar,FaSearch,FaPrint,FaFacebook,FaFile,FaFigma} from "react-icons/fa"
<h1 className="bg-yellow-400 text-white " >bievvnvenue</h1>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button> 
<button className="text-green-500"><FaEdit size="40px" className=" bg-white-500 text-blue-800 flex items-center gap-2" />Modifier</button>
<button><FaTrash size="20px" className="flex items-center gap-2" />Supprimer</button>
<button><FaShoppingCart size="30px" className="flex items-center gap-2" />Panier</button>
<button><FaBox size="30px" className="flex items-center gap-2" />Stock</button>
<button><FaUser size="30px" className="flex items-center gap-2" />Utilisateur</button>
<button><FaChartBar size="30px" className="flex items-center gap-2" />Statistiques</button>
<button><FaSearch size="30px" className="flex items-center gap-2" />Rechercher</button>
<button><FaPrint size="30px" className="flex items-center gap-2" />Imprimer</button>
<button><FaFacebook size="30px" className="flex items-center gap-2" />Facebook</button>
<button><FaFile size="30px" className="flex items-center gap-2" />Fichier</button>
<button><FaFigma size="30px" className="flex items-center gap-2" />Figma</button>  
<Dashbord />
<Ventes /> 


// avant 
<nav style={{display:'flex', gap:'20px',padding:'20px'}}>
<NavLink to="/" className={({isActive})=>isActive?"lien active" : "lien"}>Acceuil</NavLink>
<NavLink to="/ventes" className={({isActive})=>isActive?"lien active" : "lien"}>About</NavLink>
<NavLink to="/stock" className={({isActive})=>isActive?"lien active" : "lien"}>Contact</NavLink>
</nav>

<Routes>
  <Route path="/" element={<Dashbord />} />
  <Route path="/ventes" element={<Ventes />} />
  <Route path="/stock" element={<Stock />} />
  <Route />
    </Routes>

*/

 /* return (
    <>

        

 
  
</>
  )
}

export default App*/

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/useAuth';
import Connexion from './pages/Connexion';
import CreerCompte from './pages/CreerCompte';
import ConfigurationBoutique from './pages/ConfigurationBoutique';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './composant/DashboardLayout';
import Ventes from './pages/Ventes';
import Produits from './pages/Produits';
import Stock from './pages/Stock';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/creer-compte" element={<CreerCompte />} />
      <Route path="/configuration-boutique" element={<PrivateRoute><ConfigurationBoutique /></PrivateRoute>} />

      <Route  element={<PrivateRoute><DashboardLayout /></PrivateRoute>} >
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/ventes" element={<Ventes />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/stock" element={<Stock />} />
      </Route>
      <Route path="*" element={<Navigate to="/connexion" />} />
    </Routes>
  );
}
