import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Guarda de ruta: redirige a /login si no hay sesión activa. */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}