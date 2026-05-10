import { useContext } from 'react'
import { AuthContext } from './auth-context'

// Hook de conveniencia: cualquier componente puede leer el estado de auth con
// useAuth() sin tener que importar el contexto y useContext por separado.
export function useAuth() {
  return useContext(AuthContext)
}
