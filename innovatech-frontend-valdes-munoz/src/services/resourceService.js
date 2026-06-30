import api, { call } from './api.js'

const BASE = '/api/resources'

export const getResources           = ()                          => call(() => api.get(`${BASE}/`).then(r => r.data))
export const getAvailableResources  = ()                          => call(() => api.get(`${BASE}/available`).then(r => r.data))
export const getResourcesByDepartment=(dept)                      => call(() => api.get(`${BASE}/department/${encodeURIComponent(dept)}`).then(r => r.data))
export const getResourceById        = (id)                        => call(() => api.get(`${BASE}/${id}`).then(r => r.data))
export const createResource         = (data)                      => call(() => api.post(`${BASE}/`, data).then(r => r.data))
export const updateAvailability     = (id, available)             => call(() => api.patch(`${BASE}/${id}/availability`, { available }).then(r => r.data))
export const assignResourceToProject= (id, projectId, projectName)=> call(() => api.patch(`${BASE}/${id}/assign`, { projectId, projectName }).then(r => r.data))
export const deleteResource         = (id)                        => call(() => api.delete(`${BASE}/${id}`))