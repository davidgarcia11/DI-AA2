import { vi, test, expect, beforeEach } from 'vitest'
import axios from 'axios'
import {
  getSubscription,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../services/subscriptions.service'

vi.mock('axios')

beforeEach(() => {
  vi.clearAllMocks()
})

test('getSubscriptions llama a GET /subscriptions con el header Authorization Bearer', async () => {
  const fakeSubscriptions = [
    { id: 1, name: 'Netflix', price: 15.9, userId: 1 },
    { id: 2, name: 'Spotify', price: 9.99, userId: 1 },
  ]
  axios.get.mockResolvedValue({ data: fakeSubscriptions })

  const result = await getSubscriptions('token123')

  expect(axios.get).toHaveBeenCalledWith(
    expect.stringContaining('/subscriptions'),
    { headers: { Authorization: 'Bearer token123' } }
  )
  expect(result).toEqual(fakeSubscriptions)
})

test('getSubscription llama a GET /subscriptions/:id con el header Authorization', async () => {
  const fake = { id: 5, name: 'Disney+', price: 8.99, userId: 1 }
  axios.get.mockResolvedValue({ data: fake })

  const result = await getSubscription('token123', 5)

  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/subscriptions\/5$/),
    { headers: { Authorization: 'Bearer token123' } },
  )
  expect(result).toEqual(fake)
})

test('createSubscription envía POST /subscriptions con body y header Authorization', async () => {
  const newSub = { name: 'HBO Max', price: 8.99, billingCycle: 'monthly' }
  const created = { id: 3, ...newSub, userId: 1 }
  axios.post.mockResolvedValue({ data: created })

  const result = await createSubscription('token123', newSub)

  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('/subscriptions'),
    newSub,
    { headers: { Authorization: 'Bearer token123' } }
  )
  expect(result).toEqual(created)
})

test('updateSubscription envía PATCH /subscriptions/:id con cambios y header Authorization', async () => {
  const changes = { price: 12.99 }
  const updated = { id: 3, name: 'HBO Max', price: 12.99, userId: 1 }
  axios.patch.mockResolvedValue({ data: updated })

  const result = await updateSubscription('token123', 3, changes)

  expect(axios.patch).toHaveBeenCalledWith(
    expect.stringMatching(/\/subscriptions\/3$/),
    changes,
    { headers: { Authorization: 'Bearer token123' } }
  )
  expect(result).toEqual(updated)
})

test('deleteSubscription envía DELETE /subscriptions/:id con header Authorization', async () => {
  axios.delete.mockResolvedValue({ data: {} })

  await deleteSubscription('token123', 3)

  expect(axios.delete).toHaveBeenCalledWith(
    expect.stringMatching(/\/subscriptions\/3$/),
    { headers: { Authorization: 'Bearer token123' } }
  )
})
