import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import PrivateRoute from '../components/PrivateRoute.jsx'
import { describe, it, expect, beforeEach } from 'vitest'

const renderWithRouter = (route = '/') => {
  window.history.pushState({}, 'Test page', route)
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Página de Login</div>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div data-testid="dashboard-page">Dashboard Protegido</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debe redirigir a /login si el usuario NO está autenticado', () => {
    renderWithRouter('/dashboard')
    
    // Verifica que PrivateRoute interceptó la navegación y mandó al componente del login
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
  })

  it('debe renderizar el contenido protegido si el usuario SÍ está autenticado', () => {
    localStorage.setItem('innovatech_token', 'valid-token')
    localStorage.setItem('innovatech_user', JSON.stringify({ name: 'Admin', role: 'ADMIN' }))

    renderWithRouter('/dashboard')
    
    // Verifica que se permite el paso al componente protegido
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})