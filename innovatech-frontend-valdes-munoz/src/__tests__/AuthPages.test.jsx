// src/__tests__/AuthPages.test.jsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Pruebas de Integración para Interfaces de Autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('LoginPage debe renderizar el formulario y manejar flujos de error en los campos vacíos', async () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByPlaceholderText('correo@empresa.cl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu contraseña')).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(authService.login).not.toHaveBeenCalled();
  });

  test('LoginPage debe procesar el submit de credenciales y llamar a authService.login', async () => {
    authService.login.mockResolvedValue({ token: 'mock-valid-token', email: 'testuser@innovatech.com' });
    
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('correo@empresa.cl');
    const passInput = screen.getByPlaceholderText('Tu contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'testuser@innovatech.com' } });
      fireEvent.change(passInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(authService.login).toHaveBeenCalledWith({ email: 'testuser@innovatech.com', password: 'password123' });
  });

  test('RegisterPage debe renderizar todos los campos del formulario de registro corporativo', () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByPlaceholderText('Ej: Ana García')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@empresa.cl')).toBeInTheDocument();
    // Placeholder real usado en tu componente
    expect(screen.getByPlaceholderText('Crea tu contraseña segura')).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  test('RegisterPage debe enviar los datos de registro exitosamente al completar los campos', async () => {
    authService.register.mockResolvedValue({ message: 'Usuario registrado exitosamente', token: 'mock', email: 'ana@innovatech.com' });

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Ej: Ana García'), { target: { value: 'Ana García' } });
      fireEvent.change(screen.getByPlaceholderText('correo@empresa.cl'), { target: { value: 'ana@innovatech.com' } });
      // Contraseña que pasa tus validaciones: >8 caracteres, mayúscula, minúscula, número y especial
      fireEvent.change(screen.getByPlaceholderText('Crea tu contraseña segura'), { target: { value: 'SecurePass123*' } }); 
    });

    const submitBtn = screen.getByRole('button', { name: /crear cuenta/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Tu state inicial incluye role: 'EMPLOYEE' por defecto
    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ana García',
      email: 'ana@innovatech.com',
      password: 'SecurePass123*',
      role: 'EMPLOYEE'
    });
  });
});