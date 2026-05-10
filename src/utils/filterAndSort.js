// Filtra por búsqueda (substring case-insensitive en name) y categoría exacta,
// luego ordena por la columna y dirección indicadas. Función pura.
export function filterAndSortSubscriptions(subscriptions, options = {}) {
  const { search = '', category = '', sortBy = '', sortDir = 'asc' } = options

  const filtered = subscriptions.filter((sub) => {
    if (search && !sub.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (category && sub.category !== category) {
      return false
    }
    return true
  })

  if (!sortBy) return filtered

  const sorted = [...filtered].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    if (sortBy === 'renewalDate') {
      return new Date(aValue) - new Date(bValue)
    }
    if (typeof aValue === 'number') {
      return aValue - bValue
    }
    return String(aValue).localeCompare(String(bValue), 'es')
  })

  return sortDir === 'desc' ? sorted.reverse() : sorted
}
