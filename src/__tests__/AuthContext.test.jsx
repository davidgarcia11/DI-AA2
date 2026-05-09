import { test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

test('estado inicial: user y token son null cuando no hay sesión guardada', () => {
  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.user).toBeNull()
  expect(result.current.token).toBeNull()
})

test('login actualiza user y token con los datos devueltos por el servicio', async () => {
  const fakeUser = { id: 1, email: 'free@test.com', role: 'free' }
  authService.login.mockResolvedValue({
    accessToken: 'token123',
    user: fakeUser,
  })

  const { result } = renderHook(() => useAuth(), { wrapper })

  await act(async () => {
    await result.current.login('free@test.com', 'test1234')
  })

  expect(result.current.user).toEqual(fakeUser)
  expect(result.current.token).toBe('token123')
})

test('login persiste user y token en localStorage', async () => {
  const fakeUser = { id: 1, email: 'free@test.com', role: 'free' }
  authService.login.mockResolvedValue({
    accessToken: 'token123',
    user: fakeUser,
  })

  const { result } = renderHook(() => useAuth(), { wrapper })

  await act(async () => {
    await result.current.login('free@test.com', 'test1234')
  })

  expect(localStorage.getItem('token')).toBe('token123')
  expect(JSON.parse(localStorage.getItem('user'))).toEqual(fakeUser)
})

test('logout limpia user, token y las entradas de localStorage', async () => {
  authService.login.mockResolvedValue({
    accessToken: 'token123',
    user: { id: 1, email: 'free@test.com', role: 'free' },
  })

  const { result } = renderHook(() => useAuth(), { wrapper })

  await act(async () => {
    await result.current.login('free@test.com', 'test1234')
  })

  act(() => {
    result.current.logout()
  })

  expect(result.current.user).toBeNull()
  expect(result.current.token).toBeNull()
  expect(localStorage.getItem('token')).toBeNull()
  expect(localStorage.getItem('user')).toBeNull()
})

test('al montar, recupera user y token de localStorage si existen', () => {
  const savedUser = { id: 1, email: 'free@test.com', role: 'free' }
  localStorage.setItem('token', 'savedToken123')
  localStorage.setItem('user', JSON.stringify(savedUser))

  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.token).toBe('savedToken123')
  expect(result.current.user).toEqual(savedUser)
})
