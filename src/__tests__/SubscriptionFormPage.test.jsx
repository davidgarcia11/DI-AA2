import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import * as subscriptionsService from '../services/subscriptions.service'

vi.mock('../services/subscriptions.service')

function loginAs(role = 'free') {
  localStorage.setItem('token', 'fake-jwt')
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 1, email: `${role}@test.com`, role }),
  )
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

const existingSub = {
  id: 5,
  userId: 1,
  name: 'Disney+',
  price: 8.99,
  category: 'entretenimiento',
  billingCycle: 'monthly',
  renewalDate: '2026-07-01',
  domain: 'disneyplus.com',
}

describe('SubscriptionFormPage — modo crear', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('renderiza el formulario con todos los campos vacíos', () => {
    loginAs('free')
    renderAt('/subscriptions/new')

    expect(screen.getByRole('heading', { name: /nueva suscripción/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('')
    expect(screen.getByLabelText(/precio/i)).toHaveValue(null)
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ciclo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/renovación/i)).toBeInTheDocument()
  })

  test('al enviar llama a createSubscription con los datos del form y redirige a /dashboard', async () => {
    const user = userEvent.setup()
    subscriptionsService.createSubscription.mockResolvedValue({
      id: 99,
      ...existingSub,
    })
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')
    renderAt('/subscriptions/new')

    await user.type(screen.getByLabelText(/nombre/i), 'HBO Max')
    await user.type(screen.getByLabelText(/precio/i), '8.99')
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'entretenimiento')
    await user.selectOptions(screen.getByLabelText(/ciclo/i), 'monthly')
    fireEvent.change(screen.getByLabelText(/renovación/i), {
      target: { value: '2026-07-15' },
    })
    await user.type(screen.getByLabelText(/dominio/i), 'hbomax.com')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(subscriptionsService.createSubscription).toHaveBeenCalledWith(
      'fake-jwt',
      {
        userId: 1,
        name: 'HBO Max',
        price: 8.99,
        category: 'entretenimiento',
        billingCycle: 'monthly',
        renewalDate: '2026-07-15',
        domain: 'hbomax.com',
      },
    )
    expect(
      await screen.findByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })

  test('botón cancelar vuelve a /dashboard sin guardar', async () => {
    const user = userEvent.setup()
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')
    renderAt('/subscriptions/new')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(subscriptionsService.createSubscription).not.toHaveBeenCalled()
    expect(
      await screen.findByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })

  test('si createSubscription falla muestra mensaje de error', async () => {
    const user = userEvent.setup()
    subscriptionsService.createSubscription.mockRejectedValue(new Error('500'))
    loginAs('free')
    renderAt('/subscriptions/new')

    await user.type(screen.getByLabelText(/nombre/i), 'X')
    await user.type(screen.getByLabelText(/precio/i), '1')
    fireEvent.change(screen.getByLabelText(/renovación/i), {
      target: { value: '2026-07-15' },
    })
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(
      await screen.findByText(/no se pudo guardar/i),
    ).toBeInTheDocument()
  })

  test('al escribir un dominio aparece el preview del logo de Clearbit', async () => {
    const user = userEvent.setup()
    loginAs('free')
    renderAt('/subscriptions/new')

    await user.type(screen.getByLabelText(/dominio/i), 'netflix.com')

    const preview = screen.getByRole('img', { name: /vista previa del logo/i })
    expect(preview).toBeInTheDocument()
    expect(preview).toHaveAttribute('src', expect.stringContaining('netflix.com'))
  })

  test('el preview no aparece cuando el campo dominio y el nombre están vacíos', () => {
    loginAs('free')
    renderAt('/subscriptions/new')

    expect(screen.queryByRole('img', { name: /vista previa del logo/i })).not.toBeInTheDocument()
  })
})

describe('SubscriptionFormPage — modo editar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('carga la suscripción por id y rellena los campos', async () => {
    subscriptionsService.getSubscription.mockResolvedValue(existingSub)
    loginAs('free')
    renderAt('/subscriptions/5/edit')

    expect(await screen.findByDisplayValue('Disney+')).toBeInTheDocument()
    expect(screen.getByLabelText(/precio/i)).toHaveValue(8.99)
    expect(screen.getByLabelText(/renovación/i)).toHaveValue('2026-07-01')
    expect(subscriptionsService.getSubscription).toHaveBeenCalledWith(
      'fake-jwt',
      '5',
    )
  })

  test('al enviar llama a updateSubscription con id y cambios y redirige a /dashboard', async () => {
    const user = userEvent.setup()
    subscriptionsService.getSubscription.mockResolvedValue(existingSub)
    subscriptionsService.updateSubscription.mockResolvedValue({
      ...existingSub,
      price: 10.99,
    })
    subscriptionsService.getSubscriptions.mockResolvedValue([])
    loginAs('free')
    renderAt('/subscriptions/5/edit')

    const priceInput = await screen.findByLabelText(/precio/i)
    await user.clear(priceInput)
    await user.type(priceInput, '10.99')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(subscriptionsService.updateSubscription).toHaveBeenCalledWith(
      'fake-jwt',
      '5',
      expect.objectContaining({ price: 10.99 }),
    )
    expect(
      await screen.findByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })
})
