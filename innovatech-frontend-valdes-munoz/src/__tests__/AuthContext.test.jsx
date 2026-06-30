// src/__tests__/AuthContext.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth(); // Usando los nombres reales
  if (isLoading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <span data-testid="user">{user ? (user.email || user.username || 'authenticated') : 'no-user'}</span>
      <button onClick={() => login({ email: 'admin@innovatech.com' }, 'new-token')} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('debe inicializar sin usuario si localStorage está vacío (Cubre línea 26/40)', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const userEl = await screen.findByTestId('user');
    expect(userEl.textContent).toBe('no-user');
  });

  test('debe cargar usuario desde localStorage si existen datos válidos', async () => {
    // Usando las llaves reales de la app
    localStorage.setItem('innovatech_token', 'mock-token');
    localStorage.setItem('innovatech_user', JSON.stringify({ email: 'juan@innovatech.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const userEl = await screen.findByTestId('user');
    expect(userEl.textContent).toBe('juan@innovatech.com');
  });

  test('debe iniciar sesión exitosamente y guardar en localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = await screen.findByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(localStorage.getItem('innovatech_token')).toBe('new-token');
      expect(screen.getByTestId('user').textContent).toBe('admin@innovatech.com');
    });
  });

  test('debe limpiar el estado al hacer logout', async () => {
    localStorage.setItem('innovatech_token', 'mock-token');
    localStorage.setItem('innovatech_user', JSON.stringify({ email: 'juan@innovatech.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = await screen.findByTestId('logout-btn');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem('innovatech_token')).toBeNull();
      expect(screen.getByTestId('user').textContent).toBe('no-user');
    });
  });
});