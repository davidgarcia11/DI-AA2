import { expect, test } from 'vitest'
import { subscriptionsToCsv } from '../utils/csv'

test('subscriptionsToCsv genera cabecera + filas con los datos básicos', () => {
  const subs = [
    {
      id: 1,
      name: 'Netflix',
      price: 15.99,
      category: 'entretenimiento',
      billingCycle: 'monthly',
      renewalDate: '2026-06-15',
    },
    {
      id: 2,
      name: 'Adobe',
      price: 120,
      category: 'trabajo',
      billingCycle: 'yearly',
      renewalDate: '2026-12-01',
    },
  ]

  const csv = subscriptionsToCsv(subs)
  const lines = csv.split('\n')

  expect(lines[0]).toBe('name,price,category,billingCycle,renewalDate')
  expect(lines[1]).toBe('Netflix,15.99,entretenimiento,monthly,2026-06-15')
  expect(lines[2]).toBe('Adobe,120,trabajo,yearly,2026-12-01')
})

test('subscriptionsToCsv escapa nombres con comas o comillas', () => {
  const subs = [
    {
      name: 'Servicio, con coma',
      price: 5,
      category: 'otro',
      billingCycle: 'monthly',
      renewalDate: '2026-06-15',
    },
    {
      name: 'Con "comillas"',
      price: 5,
      category: 'otro',
      billingCycle: 'monthly',
      renewalDate: '2026-06-15',
    },
  ]

  const csv = subscriptionsToCsv(subs)
  const lines = csv.split('\n')

  expect(lines[1]).toBe('"Servicio, con coma",5,otro,monthly,2026-06-15')
  expect(lines[2]).toBe('"Con ""comillas""",5,otro,monthly,2026-06-15')
})
