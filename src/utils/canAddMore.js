export const FREE_LIMIT = 5

export function canAddMore(subscriptions, role) {
  if (role === 'premium') return true
  return subscriptions.length < FREE_LIMIT
}
