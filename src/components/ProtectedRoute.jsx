import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guardia de ruta: si no hay usuario en el contexto, redirige a /login.
// Si lo hay, deja pasar a los children.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}
