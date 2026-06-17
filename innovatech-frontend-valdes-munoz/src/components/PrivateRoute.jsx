import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>Cargando...</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}