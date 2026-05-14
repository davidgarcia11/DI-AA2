import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Wrapper de las rutas autenticadas: navbar fija + Outlet donde se monta la
// página activa. Se renderiza una sola vez y persiste entre navegaciones.
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const roleClass =
    user?.role === 'premium' ? 'role-badge--premium' : 'role-badge--free'

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <header className="app-header" role="banner">
        <nav className="navbar" aria-label="Navegación principal">
          <Link to="/dashboard" className="navbar-brand">
            SubTracker
          </Link>

          <ul className="navbar-links">
            <li>
              <NavLink to="/dashboard" className="nav-link" end>
                Mis suscripciones
              </NavLink>
            </li>
            {user?.role === 'premium' && (
              <li>
                <NavLink to="/analytics" className="nav-link">
                  Estadísticas avanzadas
                </NavLink>
              </li>
            )}
          </ul>

          <div className="navbar-user">
            <span className="navbar-email">{user?.email}</span>
            <span className={`role-badge ${roleClass}`}>{user?.role}</span>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
