import { createContext, useContext, useState } from 'react'
import * as authService from '../services/auth.service'

// Contexto: el "canal" por el que viajará el estado de auth a toda la app.
const AuthContext = createContext(null)

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

export function useAuth() {
  return useContext(AuthContext)
}
