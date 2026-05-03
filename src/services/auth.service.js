import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password })
  return response.data
}

export async function register(email, password) {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    role: 'free',
  })
  return response.data
}
