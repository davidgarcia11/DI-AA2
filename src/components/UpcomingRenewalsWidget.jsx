import { formatDate } from '../utils/formatters'
import { upcomingRenewals } from '../utils/stats'

export default function UpcomingRenewalsWidget({ subscriptions, daysAhead = 7 }) {
  const upcoming = upcomingRenewals(subscriptions, daysAhead)

  if (upcoming.length === 0) {
    return (
      <p className="text-muted">
        No hay renovaciones en los próximos {daysAhead} días.
      </p>
    )
  }

  return (
    <ul className="renewals-list" aria-label="Renovaciones próximas">
      {upcoming.map((sub) => (
        <li key={sub.id}>
          <strong>{sub.name}</strong>
          <time dateTime={sub.renewalDate}>{formatDate(sub.renewalDate)}</time>
        </li>
      ))}
    </ul>
  )
}
