import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartSessionProvider } from './context/CartSession.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <CartSessionProvider>
        <App />
      </CartSessionProvider>
    </SettingsProvider>
  </StrictMode>,
)
