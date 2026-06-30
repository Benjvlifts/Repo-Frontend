import api, { call } from './api.js'

const BASE = '/api/v1/analitica'

export const getAllMetrics     = ()          => call(() => api.get(`${BASE}/metricas`).then(r => r.data))
export const getProjectMetrics = (projectId) => call(() => api.get(`${BASE}/metricas/proyecto/${projectId}`).then(r => r.data))
export const getSummary        = ()          => call(() => api.get(`${BASE}/resumen`).then(r => r.data))