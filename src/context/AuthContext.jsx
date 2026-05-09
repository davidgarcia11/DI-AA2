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
    setUser(data.user)
    setToken(data.accessToken)
    // [LEARN] Guardar el JWT en localStorage es vulnerable a XSS: cualquier
    // script malicioso inyectado puede leerlo. Alternativa profesional:
    // cookie httpOnly (no accesible desde JS). Aceptable para el proyecto.
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = { user, token, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
