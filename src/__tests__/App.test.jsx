import { render, screen } from '@testing-library/react'
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

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('una ruta protegida redirige a /login si no hay usuario', () => {
    renderAt('/dashboard')

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test('/login renderiza la página de login', () => {
    renderAt('/login')

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test('/register renderiza la página de registro', () => {
    renderAt('/register')

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  test('/dashboard con usuario autenticado renderiza el dashboard', () => {
    localStorage.setItem('token', 'fake-jwt')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, email: 'free@test.com', role: 'free' }),
    )

    renderAt('/dashboard')

    expect(screen.getByRole('heading', { name: /mis suscripciones/i })).toBeInTheDocument()
  })
})
