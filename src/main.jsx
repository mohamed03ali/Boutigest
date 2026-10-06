import { StrictMode } from 'react'
import{BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './services/AuthProvider';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
 
    <CurrencyProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CurrencyProvider>
  
</BrowserRouter>
  </StrictMode>,
)
