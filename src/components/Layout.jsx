import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrapper de las rutas autenticadas: navbar fija + Outlet donde se monta la
// página activa. Se renderiza una sola vez y persiste entre navegaciones.
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header>
        <nav>
          <Link to="/dashboard">SubTracker</Link>

          <ul>
            <li>
              <NavLink to="/dashboard">Mis suscripciones</NavLink>
            </li>
            {user?.role === 'premium' && (
              <li>
                <NavLink to="/dashboard">Estadísticas avanzadas</NavLink>
              </li>
            )}
          </ul>

          <div>
            <span>{user?.email}</span>
            <span>{user?.role}</span>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  )
}
