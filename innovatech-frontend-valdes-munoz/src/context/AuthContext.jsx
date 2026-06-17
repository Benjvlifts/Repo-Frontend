/**
 * AuthContext — Patrón Observer con React Context + useReducer.
 * Cualquier componente puede "observar" el estado de autenticación.
 */
import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
    case 'RESTORE':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'LOADED':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('innovatech_token')
    const userStr = localStorage.getItem('innovatech_user')
    if (token && userStr) {
      try {
        dispatch({ type: 'RESTORE', payload: { user: JSON.parse(userStr), token } })
      } catch {
        dispatch({ type: 'LOADED' })
      }
    } else {
      dispatch({ type: 'LOADED' })
    }
  }, [])

  const login = (user, token) => {
    localStorage.setItem('innovatech_token', token)
    localStorage.setItem('innovatech_user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('innovatech_token')
    localStorage.removeItem('innovatech_user')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}