import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import * as subscriptionsService from '../services/subscriptions.service'
import { formatDate, formatPrice } from '../utils/formatters'

vi.mock('../services/subscriptions.service')

function loginAs(role = 'free') {
  localStorage.setItem('token', 'fake-jwt')
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 1, email: `${role}@test.com`, role }),
  )
}

function renderAtDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <App />
    </MemoryRouter>,
  )
}

const mockSubs = [
  {
    id: 1,
    userId: 1,
    name: 'Netflix',
    price: 15.99,
    category: 'entretenimiento',
    billingCycle: 'monthly',
    renewalDate: '2026-06-15',
    domain: 'netflix.com',
  },
  {
    id: 2,
    userId: 1,
    name: 'Spotify',
    price: 9.99,
    category: 'musica',
    billingCycle: 'monthly',
    renewalDate: '2026-06-03',
    domain: 'spotify.com',
  },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('muestra estado de carga inicial', () => {
    subscriptionsService.getSubscriptions.mockReturnValue(new Promise(() => {}))
    loginAs('free')

    renderAtDashboard()

    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  test('llama a getSubscriptions con el token al montar', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')

    renderAtDashboard()

    await screen.findByText(/no tienes suscripciones/i)
    expect(subscriptionsService.getSubscriptions).toHaveBeenCalledWith('fake-jwt')
  })

  test('renderiza la lista con nombre, precio y fecha de renovación', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue(mockSubs)
    loginAs('free')

    renderAtDashboard()

    expect(await screen.findByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(15.99))).toBeInTheDocument()
    expect(screen.getByText(formatPrice(9.99))).toBeInTheDocument()
    expect(screen.getByText(formatDate('2026-06-15'))).toBeInTheDocument()
  })

  test('cada item muestra el logo de Clearbit con el dominio del servicio', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue(mockSubs)
    loginAs('free')

    renderAtDashboard()

    const netflixLogo = await screen.findByAltText(/netflix/i)
    expect(netflixLogo).toHaveAttribute(
      'src',
      expect.stringContaining('netflix.com'),
    )
  })

  test('muestra estado vacío cuando la lista llega sin suscripciones', async () => {
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')

    renderAtDashboard()

    expect(
      await screen.findByText(/no tienes suscripciones/i),
    ).toBeInTheDocument()
  })

  test('muestra estado de error cuando getSubscriptions falla', async () => {
    subscriptionsService.getSubscriptions.mockRejectedValue(
      new Error('Network error'),
    )
    loginAs('free')

    renderAtDashboard()

    expect(
      await screen.findByText(/error al cargar/i),
    ).toBeInTheDocument()
  })

  test('botón eliminar borra la suscripción y refresca la lista', async () => {
    const user = userEvent.setup()
    subscriptionsService.getSubscriptions
      .mockResolvedValueOnce(mockSubs)
      .mockResolvedValueOnce([mockSubs[1]])
    subscriptionsService.deleteSubscription.mockResolvedValue()
    loginAs('free')

    renderAtDashboard()
    await screen.findByText('Netflix')

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(subscriptionsService.deleteSubscription).toHaveBeenCalledWith(
      'fake-jwt',
      1,
    )
    await waitFor(() =>
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Spotify')).toBeInTheDocument()
  })
})
