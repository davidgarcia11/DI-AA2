import { useCallback, useEffect, useState } from 'react'
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
import { formatDate, formatPrice } from '../utils/formatters'
import { getLogoUrl } from '../utils/logo'

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [status, setStatus] = useState('loading')

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

  const canAdd = canAddMore(subscriptions, user?.role)
  const isPremium = user?.role === 'premium'

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
      {status === 'ready' && subscriptions.length === 0 && (
        <p>No tienes suscripciones todavía.</p>
      )}

      {status === 'ready' && subscriptions.length > 0 && (
        <ul>
          {subscriptions.map((sub) => (
            <li key={sub.id}>
              <img
                src={getLogoUrl(sub.name, sub.domain)}
                alt={`Logo de ${sub.name}`}
              />
              <div>
                <h3>{sub.name}</h3>
                <p>{formatPrice(sub.price)}</p>
                <p>
                  Próxima renovación:{' '}
                  <time dateTime={sub.renewalDate}>
                    {formatDate(sub.renewalDate)}
                  </time>
                </p>
              </div>
              <Link to={`/subscriptions/${sub.id}/edit`}>Editar</Link>
              <button type="button" onClick={() => handleDelete(sub.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
