import { createContext } from 'react'

// Context object aislado en su propio fichero para que tanto AuthProvider
// como useAuth puedan importarlo sin que el linter de fast-refresh se queje
// de "non-component exports".
export const AuthContext = createContext(null)
