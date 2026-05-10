import { useEffect, useState } from 'react'
import * as authService from '../services/auth.service'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  async function login(email, password) {
    const data = await authService.login(email, password)
    persistSession(data)
  }

  async function register(email, password) {
    const data = await authService.register(email, password)
    // Tras un registro exitoso el backend devuelve token + user → auto-login.
    persistSession(data)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Si el interceptor HTTP detecta un 401 (token expirado o inválido), limpia
  // el estado en memoria. ProtectedRoute redirigirá a /login automáticamente.
  useEffect(() => {
    function handleExpired() {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  function persistSession({ accessToken, user }) {
    setUser(user)
    setToken(accessToken)
    // [LEARN] Guardar el JWT en localStorage es vulnerable a XSS: cualquier
    // script malicioso inyectado puede leerlo. Alternativa profesional:
    // cookie httpOnly (no accesible desde JS). Aceptable para el proyecto.
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const value = { user, token, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
