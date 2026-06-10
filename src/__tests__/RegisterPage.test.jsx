import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')

function renderAppAtRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <App />
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('renderiza inputs de email y contraseña y botón de submit', () => {
    renderAppAtRegister()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /crear cuenta/i }),
    ).toBeInTheDocument()
  })

  test('al enviar el formulario llama a auth.service.register con las credenciales', async () => {
    const user = userEvent.setup()
    authService.register.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 2, email: 'nuevo@test.com', role: 'free' },
    })

    renderAppAtRegister()
    await user.type(screen.getByLabelText(/email/i), 'nuevo@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(authService.register).toHaveBeenCalledWith(
      'nuevo@test.com',
      'test1234',
    )
  })

  test('tras un registro exitoso redirige a /dashboard (auto-login)', async () => {
    const user = userEvent.setup()
    authService.register.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 2, email: 'nuevo@test.com', role: 'free' },
    })

    renderAppAtRegister()
    await user.type(screen.getByLabelText(/email/i), 'nuevo@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })

  test('mientras la petición está en curso deshabilita el botón y muestra estado de carga', async () => {
    const user = userEvent.setup()
    let resolveRegister
    authService.register.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve
      }),
    )

    renderAppAtRegister()
    await user.type(screen.getByLabelText(/email/i), 'nuevo@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    const submitButton = screen.getByRole('button', { name: /creando/i })
    expect(submitButton).toBeDisabled()

    resolveRegister({
      accessToken: 'tok',
      user: { id: 2, email: 'nuevo@test.com', role: 'free' },
    })
  })

  test('si el email ya existe muestra mensaje de error', async () => {
    const user = userEvent.setup()
    authService.register.mockRejectedValue(new Error('400 Email already taken'))

    renderAppAtRegister()
    await user.type(screen.getByLabelText(/email/i), 'existe@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/no se ha podido crear la cuenta/i),
    ).toBeInTheDocument()
  })
})
