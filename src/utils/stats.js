// Convierte una suscripción a su equivalente mensual (anuales / 12).
function monthlyEquivalent(sub) {
  return sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price
}

// Calcula estadísticas básicas a partir de la lista de suscripciones del usuario.
export function computeStats(subscriptions) {
  if (subscriptions.length === 0) {
    return { count: 0, monthlyTotal: 0, nextRenewal: null }
  }

  const monthlyTotal = subscriptions.reduce(
    (sum, sub) => sum + monthlyEquivalent(sub),
    0,
  )

  const nextRenewal = [...subscriptions].sort(
    (a, b) => new Date(a.renewalDate) - new Date(b.renewalDate),
  )[0]

  return {
    count: subscriptions.length,
    monthlyTotal,
    nextRenewal,
  }
}

// Agrega el gasto mensual equivalente por categoría — alimenta el donut chart.
export function computeByCategory(subscriptions) {
  return subscriptions.reduce((acc, sub) => {
    const monthly = monthlyEquivalent(sub)
    acc[sub.category] = (acc[sub.category] ?? 0) + monthly
    return acc
  }, {})
}

// Devuelve las suscripciones cuya renewalDate cae dentro de los próximos N días
// (incluyendo hoy y el día N), ordenadas por fecha ascendente.
export function upcomingRenewals(subscriptions, daysAhead = 7) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today)
  limit.setDate(limit.getDate() + daysAhead)

  return subscriptions
    .filter((sub) => {
      const renewal = new Date(sub.renewalDate)
      renewal.setHours(0, 0, 0, 0)
      return renewal >= today && renewal <= limit
    })
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
}
