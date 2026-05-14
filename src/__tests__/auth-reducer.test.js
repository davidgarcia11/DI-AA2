import { describe, test, expect, beforeEach } from 'vitest'
import { authReducer, AUTH_ACTIONS, getInitialState } from '../context/auth-reducer'

describe('authReducer', () => {
  test('LOGIN establece user y token en el estado', () => {
    const user = { id: 1, email: 'a@b.com', role: 'free' }
    const state = authReducer(
      { user: null, token: null },
      { type: AUTH_ACTIONS.LOGIN, payload: { user, token: 'tok123' } },
    )
    expect(state).toEqual({ user, token: 'tok123' })
  })

  test('LOGOUT limpia user y token', () => {
    const state = authReducer(
      { user: { id: 1 }, token: 'tok' },
      { type: AUTH_ACTIONS.LOGOUT },
    )
    expect(state).toEqual({ user: null, token: null })
  })

  test('EXPIRED limpia user y token igual que LOGOUT', () => {
    const state = authReducer(
      { user: { id: 1 }, token: 'tok' },
      { type: AUTH_ACTIONS.EXPIRED },
    )
    expect(state).toEqual({ user: null, token: null })
  })

  test('acción desconocida devuelve el estado sin cambios (referencia igual)', () => {
    const initial = { user: { id: 1 }, token: 'tok' }
    const state = authReducer(initial, { type: 'UNKNOWN' })
    expect(state).toBe(initial)
  })
})

describe('getInitialState', () => {
  beforeEach(() => localStorage.clear())

  test('devuelve user y token nulos cuando localStorage está vacío', () => {
    expect(getInitialState()).toEqual({ user: null, token: null })
  })

  test('rehidrata user y token desde localStorage si existen', () => {
    const user = { id: 1, email: 'a@b.com', role: 'free' }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', 'tok123')
    expect(getInitialState()).toEqual({ user, token: 'tok123' })
  })
})
