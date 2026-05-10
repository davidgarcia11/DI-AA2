// Escapa un valor para CSV: si contiene comas, comillas o saltos de línea,
// se rodea con comillas y las comillas internas se duplican (RFC 4180).
function escapeCsvValue(value) {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const COLUMNS = ['name', 'price', 'category', 'billingCycle', 'renewalDate']

export function subscriptionsToCsv(subscriptions) {
  const header = COLUMNS.join(',')
  const rows = subscriptions.map((sub) =>
    COLUMNS.map((col) => escapeCsvValue(sub[col])).join(','),
  )
  return [header, ...rows].join('\n')
}
