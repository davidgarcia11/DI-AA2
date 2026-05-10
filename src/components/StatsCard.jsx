import { computeStats } from '../utils/stats'
import { formatDate, formatPrice } from '../utils/formatters'

export default function StatsCard({ subscriptions }) {
  const { count, monthlyTotal, nextRenewal } = computeStats(subscriptions)

  return (
    <section aria-label="Resumen de suscripciones">
      <article>
        <h2>Total</h2>
        <p>{count}</p>
      </article>

      <article>
        <h2>Gasto mensual</h2>
        <p>{formatPrice(monthlyTotal)}</p>
      </article>

      <article>
        <h2>Próxima renovación</h2>
        {nextRenewal ? (
          <p>
            {nextRenewal.name} —{' '}
            <time dateTime={nextRenewal.renewalDate}>
              {formatDate(nextRenewal.renewalDate)}
            </time>
          </p>
        ) : (
          <p>Sin renovaciones próximas</p>
        )}
      </article>
    </section>
  )
}
