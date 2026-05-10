import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ExportCsvButton from '../components/ExportCsvButton'
import StatsCard from '../components/StatsCard'
import UpcomingRenewalsWidget from '../components/UpcomingRenewalsWidget'

// Chart.js pesa ~150kB; sólo lo cargamos cuando un usuario premium llega al
// dashboard. Para usuarios free el bundle principal queda mucho más ligero.
const CategoryDonut = lazy(() => import('../components/CategoryDonut'))
import { useAuth } from '../context/useAuth'
import {
  deleteSubscription,
  getSubscriptions,
} from '../services/subscriptions.service'
import { canAddMore, FREE_LIMIT } from '../utils/canAddMore'
import { filterAndSortSubscriptions } from '../utils/filterAndSort'
import { formatDate, formatPrice } from '../utils/formatters'
import { getLogoUrl } from '../utils/logo'

const CATEGORIES = ['entretenimiento', 'musica', 'trabajo', 'otro']

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [status, setStatus] = useState('loading')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  // Carga inicial: efecto con flag de cancelación para evitar updates si el
  // componente se desmonta antes de que llegue la respuesta. Las llamadas a
  // setState se hacen dentro del callback async (post-await), no en el
  // cuerpo síncrono del efecto.
  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      try {
        const data = await getSubscriptions(token)
        if (!cancelled) {
          setSubscriptions(data)
          setStatus('ready')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [token])

  // Recarga manual tras un delete: vuelve al estado loading y refetch.
  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await getSubscriptions(token)
      setSubscriptions(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [token])

  async function handleDelete(id) {
    await deleteSubscription(token, id)
    await reload()
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const visibleSubs = useMemo(
    () =>
      filterAndSortSubscriptions(subscriptions, {
        search,
        category,
        sortBy,
        sortDir,
      }),
    [subscriptions, search, category, sortBy, sortDir],
  )

  const canAdd = canAddMore(subscriptions, user?.role)
  const isPremium = user?.role === 'premium'
  const hasSubs = subscriptions.length > 0

  return (
    <>
      <div className="dashboard-header">
        <h1>Mis suscripciones</h1>
        {status === 'ready' &&
          (canAdd ? (
            <Link to="/subscriptions/new" className="btn btn--primary">
              + Nueva suscripción
            </Link>
          ) : (
            <p className="alert alert--warning" role="status">
              Has alcanzado el límite de {FREE_LIMIT} suscripciones del plan free.
            </p>
          ))}
      </div>

      {status === 'loading' && (
        <p className="empty-state" role="status">
          Cargando suscripciones…
        </p>
      )}
      {status === 'error' && (
        <p className="alert alert--error" role="alert">
          Error al cargar las suscripciones. Inténtalo de nuevo más tarde.
        </p>
      )}

      {status === 'ready' && <StatsCard subscriptions={subscriptions} />}

      {status === 'ready' && isPremium && (
        <section className="premium-section" aria-label="Funcionalidades premium">
          <div className="premium-grid">
            <div>
              <h2>Gasto por categoría</h2>
              <Suspense fallback={<p className="text-muted">Cargando gráfico…</p>}>
                <CategoryDonut subscriptions={subscriptions} />
              </Suspense>
            </div>
            <div>
              <h2>Próximas renovaciones (7 días)</h2>
              <UpcomingRenewalsWidget subscriptions={subscriptions} />
            </div>
          </div>
          <div className="premium-actions">
            <ExportCsvButton subscriptions={subscriptions} />
          </div>
        </section>
      )}

      {status === 'ready' && !hasSubs && (
        <p className="empty-state">
          No tienes suscripciones todavía. Añade la primera con el botón de arriba.
        </p>
      )}

      {status === 'ready' && hasSubs && (
        <>
          <div className="toolbar" role="search" aria-label="Filtros de la tabla">
            <div className="field">
              <label htmlFor="search-input">Buscar</label>
              <input
                id="search-input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre del servicio…"
              />
            </div>

            <div className="field">
              <label htmlFor="category-select">Categoría</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleSubs.length === 0 ? (
            <p className="empty-state">
              No hay suscripciones que coincidan con los filtros.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th scope="col">Logo</th>
                    <th
                      scope="col"
                      aria-sort={ariaSort('name', sortBy, sortDir)}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('name')}
                        aria-label="Ordenar por nombre"
                      >
                        Nombre {renderSortIndicator('name', sortBy, sortDir)}
                      </button>
                    </th>
                    <th scope="col">Categoría</th>
                    <th
                      scope="col"
                      aria-sort={ariaSort('price', sortBy, sortDir)}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('price')}
                        aria-label="Ordenar por precio"
                      >
                        Precio {renderSortIndicator('price', sortBy, sortDir)}
                      </button>
                    </th>
                    <th scope="col">Ciclo</th>
                    <th
                      scope="col"
                      aria-sort={ariaSort('renewalDate', sortBy, sortDir)}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('renewalDate')}
                        aria-label="Ordenar por próxima renovación"
                      >
                        Próxima renovación{' '}
                        {renderSortIndicator('renewalDate', sortBy, sortDir)}
                      </button>
                    </th>
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSubs.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <img
                          src={getLogoUrl(sub.name, sub.domain)}
                          alt={`Logo de ${sub.name}`}
                          width="32"
                          height="32"
                        />
                      </td>
                      <td>{sub.name}</td>
                      <td>{sub.category}</td>
                      <td>{formatPrice(sub.price)}</td>
                      <td>
                        {sub.billingCycle === 'yearly' ? 'Anual' : 'Mensual'}
                      </td>
                      <td>
                        <time dateTime={sub.renewalDate}>
                          {formatDate(sub.renewalDate)}
                        </time>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            to={`/subscriptions/${sub.id}/edit`}
                            className="btn btn--ghost btn--small"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => handleDelete(sub.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}

function renderSortIndicator(column, sortBy, sortDir) {
  if (sortBy !== column) return ''
  return sortDir === 'asc' ? '▲' : '▼'
}

function ariaSort(column, sortBy, sortDir) {
  if (sortBy !== column) return 'none'
  return sortDir === 'asc' ? 'ascending' : 'descending'
}
