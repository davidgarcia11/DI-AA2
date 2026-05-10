import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import UpcomingRenewalsWidget from '../components/UpcomingRenewalsWidget'

describe('UpcomingRenewalsWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('muestra solo las suscripciones que renuevan en los próximos 7 días', () => {
    const subs = [
      { id: 1, name: 'Cercana', renewalDate: '2026-06-04' },
      { id: 2, name: 'Lejana', renewalDate: '2026-07-01' },
      { id: 3, name: 'Justo en el límite', renewalDate: '2026-06-08' },
    ]

    render(<UpcomingRenewalsWidget subscriptions={subs} />)

    expect(screen.getByText('Cercana')).toBeInTheDocument()
    expect(screen.getByText('Justo en el límite')).toBeInTheDocument()
    expect(screen.queryByText('Lejana')).not.toBeInTheDocument()
  })

  test('si no hay renovaciones próximas muestra texto fallback', () => {
    const subs = [{ id: 1, name: 'Lejana', renewalDate: '2026-07-15' }]

    render(<UpcomingRenewalsWidget subscriptions={subs} />)

    expect(
      screen.getByText(/no hay renovaciones en los próximos 7 días/i),
    ).toBeInTheDocument()
  })
})
