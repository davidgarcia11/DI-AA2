import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// [LEARN] Bearer token: el header Authorization identifica al usuario en cada
// petición. Sin él, el backend devuelve 401 porque las suscripciones tienen
// permisos 600 (solo el propietario accede).
function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function getSubscriptions(token) {
  const response = await axios.get(`${API_URL}/subscriptions`, authHeader(token))
  return response.data
}

export async function getSubscription(token, id) {
  const response = await axios.get(`${API_URL}/subscriptions/${id}`, authHeader(token))
  return response.data
}

export async function createSubscription(token, data) {
  const response = await axios.post(`${API_URL}/subscriptions`, data, authHeader(token))
  return response.data
}

export async function updateSubscription(token, id, changes) {
  const response = await axios.patch(`${API_URL}/subscriptions/${id}`, changes, authHeader(token))
  return response.data
}

export async function deleteSubscription(token, id) {
  await axios.delete(`${API_URL}/subscriptions/${id}`, authHeader(token))
}
