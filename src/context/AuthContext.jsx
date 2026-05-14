import { useEffect, useReducer } from 'react'
import * as authService from '../services/auth.service'
import { AuthContext } from './auth-context'
import { AUTH_ACTIONS, authReducer, getInitialState } from './auth-reducer'

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, getInitialState())

  async function login(email, password) {
    const data = await authService.login(email, password)
    persistSession(data)
  }

  async function register(email, password) {
    const data = await authService.register(email, password)
    persistSession(data)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  useEffect(() => {
    function handleExpired() {
      dispatch({ type: AUTH_ACTIONS.EXPIRED })
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  function persistSession({ accessToken, user }) {
    // [LEARN] localStorage persiste la sesión entre recargas, pero es
    // vulnerable a XSS. En producción se usaría cookie httpOnly.
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user, token: accessToken } })
  }

  const value = { user: state.user, token: state.token, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
