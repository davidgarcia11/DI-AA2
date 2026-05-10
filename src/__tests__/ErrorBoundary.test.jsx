import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import ErrorBoundary from '../components/ErrorBoundary'

function Boom() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy

  beforeEach(() => {
    // React imprime el error en consola al hacer caer el boundary;
    // lo silenciamos para mantener limpia la salida del test.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  test('renderiza los children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>Hola</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Hola')).toBeInTheDocument()
  })

  test('muestra el fallback cuando un hijo lanza un error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(
      screen.getByRole('heading', { name: /algo ha ido mal/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /recargar/i }),
    ).toBeInTheDocument()
  })
})
