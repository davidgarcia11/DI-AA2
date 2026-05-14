import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// allowedRoles: si se especifica, solo los usuarios con ese rol pueden pasar.
// Sin allowedRoles, cualquier usuario autenticado tiene acceso.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
