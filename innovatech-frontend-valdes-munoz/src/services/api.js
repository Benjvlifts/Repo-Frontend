/**
 * Centralized Axios instance.
 * ROOT CAUSE BUG 2: los servicios usaban localStorage.getItem('token')
 * pero AuthContext persiste con clave 'innovatech_token'.
 * Este interceptor unifica la clave y añade timeout para evitar spinners infinitos.
 */
import axios from 'axios'

const TOKEN_KEY = 'innovatech_token'

const api = axios.create({
  timeout: 10000, // 10 s — previene loading infinito si el BFF no responde
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Normaliza cualquier error de Axios en un objeto {message, status} */
export function parseError(err) {
  if (err.response) {
    const msg = err.response.data?.message || err.response.data?.error || 'Error del servidor'
    return { message: msg, status: err.response.status }
  }
  if (err.request) return { message: 'No se pudo conectar con el servidor', status: 0 }
  return { message: err.message || 'Error inesperado', status: -1 }
}

/** Wrapper que normaliza errores y garantiza que siempre lanza {message,status} */
export async function call(fn) {
  try {
    return await fn()
  } catch (err) {
    throw parseError(err)
  }
}

export default api