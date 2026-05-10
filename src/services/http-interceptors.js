import axios from 'axios'

// Interceptor global de respuestas: si llega un 401 desde cualquier servicio,
// limpia la sesión almacenada y notifica al resto de la app vía evento custom.
// Se registra una sola vez en main.jsx para que afecte a todas las llamadas.
let registered = false

export function registerHttpInterceptors() {
  if (registered) return
  registered = true

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth:expired'))
      }
      return Promise.reject(error)
    },
  )
}
