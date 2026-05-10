import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryDonut from '../components/CategoryDonut'
import ExportCsvButton from '../components/ExportCsvButton'
import StatsCard from '../components/StatsCard'
import UpcomingRenewalsWidget from '../components/UpcomingRenewalsWidget'
import { useAuth } from '../context/AuthContext'
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

  const loadSubscriptions = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await getSubscriptions(token)
      setSubscriptions(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [token])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  async function handleDelete(id) {
    await deleteSubscription(token, id)
    await loadSubscriptions()
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
      <h1>Mis suscripciones</h1>

      {status === 'ready' && <StatsCard subscriptions={subscriptions} />}

      {status === 'ready' && isPremium && (
        <section aria-label="Funcionalidades premium">
          <h2>Gasto por categoría</h2>
          <CategoryDonut subscriptions={subscriptions} />

          <h2>Próximas renovaciones (7 días)</h2>
          <UpcomingRenewalsWidget subscriptions={subscriptions} />

          <ExportCsvButton subscriptions={subscriptions} />
        </section>
      )}

      {status === 'ready' &&
        (canAdd ? (
          <Link to="/subscriptions/new">Nueva suscripción</Link>
        ) : (
          <p>Has alcanzado el límite de {FREE_LIMIT} suscripciones del plan free.</p>
        ))}

      {status === 'loading' && <p>Cargando suscripciones…</p>}
      {status === 'error' && <p>Error al cargar las suscripciones.</p>}
      {status === 'ready' && !hasSubs && <p>No tienes suscripciones todavía.</p>}

      {status === 'ready' && hasSubs && (
        <>
          <div role="search">
            <label>
              Buscar
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre del servicio…"
              />
            </label>

            <label>
              Categoría
              <select
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
            </label>
          </div>

          {visibleSubs.length === 0 ? (
            <p>No hay suscripciones que coincidan con los filtros.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Logo</th>
                  <th scope="col">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      aria-label="Ordenar por nombre"
                    >
                      Nombre {renderSortIndicator('name', sortBy, sortDir)}
                    </button>
                  </th>
                  <th scope="col">Categoría</th>
                  <th scope="col">
                    <button
                      type="button"
                      onClick={() => handleSort('price')}
                      aria-label="Ordenar por precio"
                    >
                      Precio {renderSortIndicator('price', sortBy, sortDir)}
                    </button>
                  </th>
                  <th scope="col">Ciclo</th>
                  <th scope="col">
                    <button
                      type="button"
                      onClick={() => handleSort('renewalDate')}
                      aria-label="Ordenar por próxima renovación"
                    >
                      Próxima renovación{' '}
                      {renderSortIndicator('renewalDate', sortBy, sortDir)}
                    </button>
                  </th>
                  <th scope="col">Acciones</th>
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
                    <td>{sub.billingCycle === 'yearly' ? 'Anual' : 'Mensual'}</td>
                    <td>
                      <time dateTime={sub.renewalDate}>
                        {formatDate(sub.renewalDate)}
                      </time>
                    </td>
                    <td>
                      <Link to={`/subscriptions/${sub.id}/edit`}>Editar</Link>
                      <button type="button" onClick={() => handleDelete(sub.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
