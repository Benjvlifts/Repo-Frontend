import api, { call } from './api.js'

const BASE = '/api/v1/notificaciones'

export const getNotifications      = (projectId)      => call(() => api.get(`${BASE}/proyecto/${projectId}`).then(r => r.data))
export const getUnreadNotifications= (projectId)      => call(() => api.get(`${BASE}/proyecto/${projectId}/no-leidas`).then(r => r.data))
export const markAsRead            = (notificationId) => call(() => api.patch(`${BASE}/${notificationId}/read`, {}))