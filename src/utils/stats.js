// Calcula estadísticas básicas a partir de la lista de suscripciones del usuario.
export function computeStats(subscriptions) {
  if (subscriptions.length === 0) {
    return { count: 0, monthlyTotal: 0, nextRenewal: null }
  }

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    const monthly = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price
    return sum + monthly
  }, 0)

  const nextRenewal = [...subscriptions].sort(
    (a, b) => new Date(a.renewalDate) - new Date(b.renewalDate),
  )[0]

  return {
    count: subscriptions.length,
    monthlyTotal,
    nextRenewal,
  }
}
