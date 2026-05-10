import { describe, expect, test } from 'vitest'
import { filterAndSortSubscriptions } from '../utils/filterAndSort'

const subs = [
  { id: 1, name: 'Netflix', price: 15.99, category: 'entretenimiento', renewalDate: '2026-06-15' },
  { id: 2, name: 'Spotify', price: 9.99, category: 'musica', renewalDate: '2026-06-03' },
  { id: 3, name: 'Adobe', price: 54.99, category: 'trabajo', renewalDate: '2026-12-01' },
  { id: 4, name: 'HBO Max', price: 8.99, category: 'entretenimiento', renewalDate: '2026-08-10' },
]

describe('filterAndSortSubscriptions', () => {
  test('sin filtros ni orden devuelve todas las suscripciones tal cual', () => {
    const result = filterAndSortSubscriptions(subs, {})
    expect(result).toHaveLength(4)
    expect(result.map((s) => s.name)).toEqual(['Netflix', 'Spotify', 'Adobe', 'HBO Max'])
  })

  test('filtra por búsqueda en el nombre (case insensitive y substring)', () => {
    const result = filterAndSortSubscriptions(subs, { search: 'net' })
    expect(result.map((s) => s.name)).toEqual(['Netflix'])
  })

  test('filtra por categoría exacta', () => {
    const result = filterAndSortSubscriptions(subs, { category: 'entretenimiento' })
    expect(result.map((s) => s.name)).toEqual(['Netflix', 'HBO Max'])
  })

  test('combina búsqueda y categoría', () => {
    const result = filterAndSortSubscriptions(subs, {
      search: 'h',
      category: 'entretenimiento',
    })
    expect(result.map((s) => s.name)).toEqual(['HBO Max'])
  })

  test('ordena por precio ascendente', () => {
    const result = filterAndSortSubscriptions(subs, {
      sortBy: 'price',
      sortDir: 'asc',
    })
    expect(result.map((s) => s.name)).toEqual(['HBO Max', 'Spotify', 'Netflix', 'Adobe'])
  })

  test('ordena por precio descendente', () => {
    const result = filterAndSortSubscriptions(subs, {
      sortBy: 'price',
      sortDir: 'desc',
    })
    expect(result.map((s) => s.name)).toEqual(['Adobe', 'Netflix', 'Spotify', 'HBO Max'])
  })

  test('ordena por nombre alfabéticamente', () => {
    const result = filterAndSortSubscriptions(subs, {
      sortBy: 'name',
      sortDir: 'asc',
    })
    expect(result.map((s) => s.name)).toEqual(['Adobe', 'HBO Max', 'Netflix', 'Spotify'])
  })

  test('ordena por fecha de renovación ascendente', () => {
    const result = filterAndSortSubscriptions(subs, {
      sortBy: 'renewalDate',
      sortDir: 'asc',
    })
    expect(result.map((s) => s.name)).toEqual(['Spotify', 'Netflix', 'HBO Max', 'Adobe'])
  })

  test('combina filtro y orden — filtra primero, luego ordena', () => {
    const result = filterAndSortSubscriptions(subs, {
      category: 'entretenimiento',
      sortBy: 'price',
      sortDir: 'asc',
    })
    expect(result.map((s) => s.name)).toEqual(['HBO Max', 'Netflix'])
  })
})
