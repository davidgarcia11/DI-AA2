import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import * as subscriptionsService from '../services/subscriptions.service'

vi.mock('../services/subscriptions.service')
vi.mock('react-chartjs-2', () => ({ Doughnut: () => <div data-testid="donut" /> }))

function loginAs(role) {
  localStorage.setItem('token', 'fake-jwt')
  localStorage.setItem('user', JSON.stringify({ id: 1, email: `${role}@test.com`, role }))
}

function renderAtAnalytics() {
  return render(
    <MemoryRouter initialEntries={['/analytics']}>
      <App />
    </MemoryRouter>,
  )
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('usuario premium ve la página de estadísticas avanzadas', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('premium')

    renderAtAnalytics()

    expect(await screen.findByRole('heading', { name: /estadísticas avanzadas/i })).toBeInTheDocument()
  })

  test('usuario free es redirigido al dashboard desde /analytics', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')

    renderAtAnalytics()

    expect(await screen.findByRole('heading', { name: /mis suscripciones/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /estadísticas avanzadas/i })).not.toBeInTheDocument()
  })

  test('usuario no autenticado es redirigido al login desde /analytics', () => {
    renderAtAnalytics()

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test('muestra estado de carga al inicio', () => {
    subscriptionsService.getSubscriptions.mockReturnValue(new Promise(() => {}))
    loginAs('premium')

    renderAtAnalytics()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('muestra error si getSubscriptions falla', async () => {
    subscriptionsService.getSubscriptions.mockRejectedValue(new Error('fail'))
    loginAs('premium')

    renderAtAnalytics()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
