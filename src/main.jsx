import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { registerHttpInterceptors } from './services/http-interceptors'
import './index.css'
import App from './App.jsx'

// Interceptor global de 401: limpia sesión y notifica via evento 'auth:expired'.
registerHttpInterceptors()

// BrowserRouter va aquí (no en App) para que en tests podamos envolver
// <App> con <MemoryRouter> y controlar la URL inicial sin tocar window.history.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
