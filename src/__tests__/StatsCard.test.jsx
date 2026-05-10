import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import StatsCard from '../components/StatsCard'
import { formatDate, formatPrice } from '../utils/formatters'

describe('StatsCard', () => {
  test('muestra count, total mensual y próxima renovación', () => {
    const subscriptions = [
      {
        id: 1,
        name: 'Netflix',
        price: 10,
        billingCycle: 'monthly',
        renewalDate: '2026-06-15',
      },
      {
        id: 2,
        name: 'Adobe',
        price: 120,
        billingCycle: 'yearly',
        renewalDate: '2026-06-03',
      },
    ]

    render(<StatsCard subscriptions={subscriptions} />)

    // 2 suscripciones, 10 + (120/12) = 20€/mes, próxima Adobe
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(20))).toBeInTheDocument()
    expect(screen.getByText(/Adobe/)).toBeInTheDocument()
    expect(screen.getByText(formatDate('2026-06-03'))).toBeInTheDocument()
  })

  test('con lista vacía muestra ceros y un guion para la próxima renovación', () => {
    render(<StatsCard subscriptions={[]} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(0))).toBeInTheDocument()
    expect(screen.getByText(/sin renovaciones/i)).toBeInTheDocument()
  })
})
