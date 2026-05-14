import { lazy, Suspense, useEffect, useState } from 'react'
import UpcomingRenewalsWidget from '../components/UpcomingRenewalsWidget'
import { useAuth } from '../context/useAuth'
import { getSubscriptions } from '../services/subscriptions.service'

const CategoryDonut = lazy(() => import('../components/CategoryDonut'))

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
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
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <>
      <h1>Estadísticas avanzadas</h1>

      {status === 'loading' && (
        <p className="empty-state" role="status">
          Cargando estadísticas…
        </p>
      )}

      {status === 'error' && (
        <p className="alert alert--error" role="alert">
          Error al cargar las estadísticas. Inténtalo de nuevo más tarde.
        </p>
      )}

      {status === 'ready' && (
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
      )}
    </>
  )
}
