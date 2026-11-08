import { StrictMode } from 'react'
import{BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './services/AuthProvider';

import { db } from './db/db'
db.on('blocked', () => console.warn('BASE BLOQUÉE par un autre onglet'))
db.open()
  .then(() => console.log('BASE OUVERTE, version', db.verno))
  .catch((e) => console.error('ERREUR BASE', e))
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
 <AuthProvider>
    <CurrencyProvider>
        <App />
    </CurrencyProvider>
  </AuthProvider>
</BrowserRouter>
  </StrictMode>,
)
