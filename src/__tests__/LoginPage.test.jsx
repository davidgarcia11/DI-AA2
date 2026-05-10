import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')

function renderAppAtLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('renderiza inputs de email y contraseña y botón de submit', () => {
    renderAppAtLogin()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument()
  })

  test('al enviar el formulario llama a auth.service.login con las credenciales', async () => {
    const user = userEvent.setup()
    authService.login.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 1, email: 'free@test.com', role: 'free' },
    })

    renderAppAtLogin()
    await user.type(screen.getByLabelText(/email/i), 'free@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(authService.login).toHaveBeenCalledWith('free@test.com', 'test1234')
  })

  test('tras un login exitoso redirige a /dashboard', async () => {
    const user = userEvent.setup()
    authService.login.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 1, email: 'free@test.com', role: 'free' },
    })

    renderAppAtLogin()
    await user.type(screen.getByLabelText(/email/i), 'free@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'test1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })

  test('si las credenciales son inválidas muestra mensaje de error', async () => {
    const user = userEvent.setup()
    authService.login.mockRejectedValue(new Error('401 Unauthorized'))

    renderAppAtLogin()
    await user.type(screen.getByLabelText(/email/i), 'wrong@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText(/email o contraseña incorrectos/i),
    ).toBeInTheDocument()
  })
})
