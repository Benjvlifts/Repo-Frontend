import api, { call } from './api.js'

export const login       = (credentials) => call(() => api.post('/api/auth/login', credentials).then(r => r.data))
export const register    = (userData)    => call(() => api.post('/api/auth/register', userData).then(r => r.data))
export const getUsers    = ()            => call(() => api.get('/api/auth/users').then(r => r.data))
export const getEmployees= ()            => getUsers().then(list => list.filter(u => u.role === 'EMPLOYEE'))