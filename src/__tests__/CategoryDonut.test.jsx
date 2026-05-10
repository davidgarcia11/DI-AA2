import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import CategoryDonut from '../components/CategoryDonut'

// Mock de react-chartjs-2: Chart.js requiere canvas, así que renderizamos un
// stub que expone los datos vía atributos para poder asertar contra ellos.
vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }) => (
    <div
      data-testid="donut"
      data-labels={JSON.stringify(data.labels)}
      data-values={JSON.stringify(data.datasets[0].data)}
    />
  ),
}))

describe('CategoryDonut', () => {
  test('renderiza el chart con labels y valores agregados por categoría', () => {
    const subs = [
      { price: 10, billingCycle: 'monthly', category: 'entretenimiento' },
      { price: 5, billingCycle: 'monthly', category: 'entretenimiento' },
      { price: 8, billingCycle: 'monthly', category: 'musica' },
    ]

    render(<CategoryDonut subscriptions={subs} />)

    const chart = screen.getByTestId('donut')
    expect(JSON.parse(chart.dataset.labels)).toEqual([
      'entretenimiento',
      'musica',
    ])
    expect(JSON.parse(chart.dataset.values)).toEqual([15, 8])
  })

  test('con lista vacía muestra texto fallback en lugar del chart', () => {
    render(<CategoryDonut subscriptions={[]} />)

    expect(screen.queryByTestId('donut')).not.toBeInTheDocument()
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument()
  })
})
