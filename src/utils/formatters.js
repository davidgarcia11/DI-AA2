export function formatPrice(amount) {
  // \xa0 es el "non-breaking space" que Intl usa en es-ES entre número y símbolo
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount).replace(/\xa0/g, ' ')
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('es-ES').format(new Date(dateString))
}

export function daysUntil(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}
