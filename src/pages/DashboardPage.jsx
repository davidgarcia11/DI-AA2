import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  deleteSubscription,
  getSubscriptions,
} from '../services/subscriptions.service'
import { formatDate, formatPrice } from '../utils/formatters'
import { getLogoUrl } from '../utils/logo'

export default function DashboardPage() {
  const { token } = useAuth()
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

  return (
    <>
      <h1>Mis suscripciones</h1>

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
