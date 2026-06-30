import api, { call } from './api.js'

const BASE = '/api/projects'

export const getProjects         = (params = {})             => call(() => api.get(`${BASE}/`, { params }).then(r => r.data))
export const getProjectById      = (id)                      => call(() => api.get(`${BASE}/${id}`).then(r => r.data))
export const createProject       = (data)                    => call(() => api.post(`${BASE}/`, data).then(r => r.data))
export const updateProject       = (id, data)                => call(() => api.put(`${BASE}/${id}`, data).then(r => r.data))
export const deleteProject       = (id)                      => call(() => api.delete(`${BASE}/${id}`))
export const updateProjectStatus = (id, status)              => call(() => api.patch(`${BASE}/${id}/status`, { status }).then(r => r.data))
export const assignEmployee      = (id, employeeId, name)    => call(() => api.patch(`${BASE}/${id}/assign`, { employeeId, employeeName: name }).then(r => r.data))
export const unassignEmployee    = (id)                      => call(() => api.delete(`${BASE}/${id}/assign`).then(r => r.data))
export const getNotes            = (id)                      => call(() => api.get(`${BASE}/${id}/notes`).then(r => r.data))
export const addNote             = (id, content)             => call(() => api.post(`${BASE}/${id}/notes`, { content }).then(r => r.data))
export const reviewNote          = (id, noteId, data)        => call(() => api.patch(`${BASE}/${id}/notes/${noteId}/review`, data).then(r => r.data))