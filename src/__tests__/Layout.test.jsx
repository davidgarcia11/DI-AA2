import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test } from 'vitest'
import App from '../App'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function loginAs(role) {
  localStorage.setItem('token', 'fake-jwt')
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 1, email: `${role}@test.com`, role }),
  )
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('muestra el email del usuario en la navbar', () => {
    loginAs('free')
    renderAt('/dashboard')

    expect(screen.getByText('free@test.com')).toBeInTheDocument()
  })

  test('muestra el badge con el rol del usuario', () => {
    loginAs('premium')
    renderAt('/dashboard')

    // Badge con el rol exacto (no confundir con "premium@test.com").
    expect(screen.getByText(/^premium$/i)).toBeInTheDocument()
  })

  test('renderiza el contenido de la ruta hija via Outlet', () => {
    loginAs('free')
    renderAt('/dashboard')

    expect(
      screen.getByRole('heading', { name: /mis suscripciones/i }),
    ).toBeInTheDocument()
  })

  test('usuario premium ve el enlace a estadísticas avanzadas', () => {
    loginAs('premium')
    renderAt('/dashboard')

    expect(
      screen.getByRole('link', { name: /estadísticas avanzadas/i }),
    ).toBeInTheDocument()
  })

  test('usuario free NO ve el enlace a estadísticas avanzadas', () => {
    loginAs('free')
    renderAt('/dashboard')

    expect(
      screen.queryByRole('link', { name: /estadísticas avanzadas/i }),
    ).not.toBeInTheDocument()
  })

  test('logout limpia la sesión y redirige a /login', async () => {
    const user = userEvent.setup()
    loginAs('free')
    renderAt('/dashboard')

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(
      screen.getByRole('heading', { name: /iniciar sesión/i }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
