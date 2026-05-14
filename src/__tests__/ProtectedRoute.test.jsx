import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { beforeEach, describe, expect, test } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

function renderAtDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('redirige a /login cuando no hay usuario en el contexto', () => {
    renderAtDashboard()

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument()
  })

  test('renderiza los children cuando hay usuario autenticado', () => {
    localStorage.setItem('token', 'fake-jwt')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, email: 'free@test.com', role: 'free' }),
    )

    renderAtDashboard()

    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

describe('ProtectedRoute — control de acceso por rol', () => {
  beforeEach(() => localStorage.clear())

  function renderWithRole(role, allowedRoles) {
    if (role) {
      localStorage.setItem('token', 'fake-jwt')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: `${role}@test.com`, role }))
    }
    return render(
      <MemoryRouter initialEntries={['/analytics']}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <div>Analytics Page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  test('usuario premium accede a la ruta con allowedRoles premium', () => {
    renderWithRole('premium', ['premium'])
    expect(screen.getByText('Analytics Page')).toBeInTheDocument()
  })

  test('usuario free es redirigido al dashboard desde una ruta premium', () => {
    renderWithRole('free', ['premium'])
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Analytics Page')).not.toBeInTheDocument()
  })

  test('sin allowedRoles cualquier usuario autenticado accede', () => {
    renderWithRole('free', undefined)
    expect(screen.getByText('Analytics Page')).toBeInTheDocument()
  })
})
