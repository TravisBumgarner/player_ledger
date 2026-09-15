import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'

// BrowserRouter for a hosted SPA. If this build is ever loaded over file://
// (Electron, Capacitor, an extension), switch to HashRouter — BrowserRouter
// cannot resolve routes under that protocol.
const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
