import { formatPrice, daysUntil } from '../utils/formatters'

test('formatPrice convierte número a precio en euros', () => {
  expect(formatPrice(15.9)).toBe('15,90 €')
})

test('formatPrice formatea precio entero con dos decimales', () => {
  expect(formatPrice(10)).toBe('10,00 €')
})

test('daysUntil devuelve 0 para la fecha de hoy', () => {
  const today = new Date().toISOString().split('T')[0]
  expect(daysUntil(today)).toBe(0)
})

test('daysUntil devuelve número negativo para fecha pasada', () => {
  expect(daysUntil('2020-01-01')).toBeLessThan(0)
})
