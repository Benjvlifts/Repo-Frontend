import MockAdapter from 'axios-mock-adapter'
import api from '../services/api.js'
import { login, getEmployees } from '../services/authService.js'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Servicios de API (Axios + Mock Adapter)', () => {
  let mock

  beforeEach(() => {
    // Es crítico mockear la misma instancia exportada en api.js para que pase por los interceptores
    mock = new MockAdapter(api)
    localStorage.clear()
  })

  afterEach(() => {
    mock.restore()
  })

  it('login() debe enviar credenciales y retornar payload', async () => {
    const mockResponse = { userId: 1, name: 'Benjamín', token: 'jwt-123', role: 'EMPLOYEE' }
    mock.onPost('/api/auth/login').reply(200, mockResponse)

    const credentials = { email: 'benjamin@innovatech.cl', password: 'password123' }
    const result = await login(credentials)

    expect(result).toEqual(mockResponse)
    expect(mock.history.post[0].data).toBe(JSON.stringify(credentials))
  })

  it('el interceptor de api.js debe inyectar el token en el header de peticiones subsecuentes', async () => {
    localStorage.setItem('innovatech_token', 'token-in-storage')
    const mockUsers = [{ id: 1, role: 'EMPLOYEE' }]
    mock.onGet('/api/auth/users').reply(200, mockUsers)

    await getEmployees()

    const authHeader = mock.history.get[0].headers.Authorization
    expect(authHeader).toBe('Bearer token-in-storage')
  })

  it('getEmployees() debe filtrar correctamente y retornar solo usuarios con rol EMPLOYEE', async () => {
    const mockUsers = [
      { id: 1, name: 'Juan', role: 'EMPLOYEE' },
      { id: 2, name: 'Pedro', role: 'ADMIN' },
      { id: 3, name: 'Ana', role: 'EMPLOYEE' },
      { id: 4, name: 'Luis', role: 'MANAGER' }
    ]
    mock.onGet('/api/auth/users').reply(200, mockUsers)

    const result = await getEmployees()

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Juan')
    expect(result[1].name).toBe('Ana')
  })

  it('call() y parseError() en api.js deben interceptar fallos y estructurar el error (401)', async () => {
    mock.onPost('/api/auth/login').reply(401, { message: 'Credenciales inválidas' })

    await expect(login({ email: 'bad', password: 'bad' })).rejects.toEqual({
      message: 'Credenciales inválidas',
      status: 401
    })
  })

    test('API Interceptor debe rechazar la promesa cuando la respuesta contiene un error HTTP', async () => {
    mock.onGet('/any-endpoint').reply(500, { message: 'Internal Server Error' });

    await expect(api.get('/any-endpoint')).rejects.toThrow();
    });
})