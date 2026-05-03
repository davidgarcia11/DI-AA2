import { vi, test, expect, beforeEach } from 'vitest'
import axios from 'axios'
import { login, register } from '../services/auth.service'

vi.mock('axios')

beforeEach(() => {
  vi.clearAllMocks()
})

test('login devuelve accessToken y user cuando las credenciales son correctas', async () => {
  axios.post.mockResolvedValue({
    data: { accessToken: 'token123', user: { id: 1, email: 'test@test.com', role: 'free' } }
  })

  const result = await login('test@test.com', 'test1234')

  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('/login'),
    { email: 'test@test.com', password: 'test1234' }
  )
  expect(result.accessToken).toBe('token123')
  expect(result.user.role).toBe('free')
})

test('login lanza error cuando las credenciales son incorrectas', async () => {
  axios.post.mockRejectedValue(new Error('Request failed with status code 400'))

  await expect(login('bad@test.com', 'wrong')).rejects.toThrow()
})

test('register llama al endpoint /register con email y password', async () => {
  axios.post.mockResolvedValue({
    data: { accessToken: 'token456', user: { id: 2, email: 'new@test.com', role: 'free' } }
  })

  await register('new@test.com', 'password123')

  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('/register'),
    expect.objectContaining({ email: 'new@test.com', password: 'password123' })
  )
})
