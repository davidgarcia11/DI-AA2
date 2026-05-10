import { expect, test, vi } from 'vitest'
import {
  computeByCategory,
  computeStats,
  upcomingRenewals,
} from '../utils/stats'

test('lista vacía devuelve count 0, total 0 y nextRenewal null', () => {
  expect(computeStats([])).toEqual({
    count: 0,
    monthlyTotal: 0,
    nextRenewal: null,
  })
})

test('count refleja el número total de suscripciones', () => {
  const subs = [
    { id: 1, price: 5, billingCycle: 'monthly', renewalDate: '2026-06-10' },
    { id: 2, price: 10, billingCycle: 'monthly', renewalDate: '2026-06-15' },
    { id: 3, price: 12, billingCycle: 'yearly', renewalDate: '2026-12-01' },
  ]
  expect(computeStats(subs).count).toBe(3)
})

test('monthlyTotal suma los precios mensuales y los anuales divididos entre 12', () => {
  const subs = [
    { id: 1, price: 10, billingCycle: 'monthly', renewalDate: '2026-06-10' },
    { id: 2, price: 120, billingCycle: 'yearly', renewalDate: '2026-12-01' },
  ]
  // 10 + (120/12) = 20
  expect(computeStats(subs).monthlyTotal).toBe(20)
})

test('nextRenewal devuelve la suscripción con la fecha más cercana', () => {
  const subs = [
    { id: 1, name: 'Lejana', price: 5, billingCycle: 'monthly', renewalDate: '2026-12-31' },
    { id: 2, name: 'Cercana', price: 10, billingCycle: 'monthly', renewalDate: '2026-06-03' },
    { id: 3, name: 'Media', price: 8, billingCycle: 'monthly', renewalDate: '2026-08-15' },
  ]
  expect(computeStats(subs).nextRenewal.name).toBe('Cercana')
})

test('computeByCategory agrega el gasto mensual por categoría', () => {
  const subs = [
    { price: 10, billingCycle: 'monthly', category: 'entretenimiento' },
    { price: 5, billingCycle: 'monthly', category: 'entretenimiento' },
    { price: 120, billingCycle: 'yearly', category: 'trabajo' },
    { price: 8, billingCycle: 'monthly', category: 'musica' },
  ]
  expect(computeByCategory(subs)).toEqual({
    entretenimiento: 15,
    trabajo: 10,
    musica: 8,
  })
})

test('computeByCategory con lista vacía devuelve un objeto vacío', () => {
  expect(computeByCategory([])).toEqual({})
})

test('upcomingRenewals devuelve las suscripciones que renuevan en los próximos N días', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-01T12:00:00'))

  const subs = [
    { id: 1, name: 'En 3 días', renewalDate: '2026-06-04' },
    { id: 2, name: 'En 10 días', renewalDate: '2026-06-11' },
    { id: 3, name: 'En 7 días', renewalDate: '2026-06-08' },
    { id: 4, name: 'Ayer', renewalDate: '2026-05-31' },
  ]

  const result = upcomingRenewals(subs, 7)

  expect(result.map((s) => s.name)).toEqual(['En 3 días', 'En 7 días'])
  vi.useRealTimers()
})
