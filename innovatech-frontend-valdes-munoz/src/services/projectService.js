import axios from 'axios'

const client = axios.create({ baseURL: '/api/projects', timeout: 10000 })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('innovatech_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function parseError(err) {
  if (err.response) return { message: err.response.data?.message ?? 'Error del servidor', status: err.response.status }
  return { message: 'No se pudo conectar con el servidor', status: 0 }
}

// ── CRUD básico ───────────────────────────────────────────────────────────────

export async function getProjects(params = {}) {
  try {
    const { data } = await client.get('/', { params })
    return data
  } catch (e) { throw parseError(e) }
}

export async function createProject(projectData) {
  try {
    const { data } = await client.post('/', projectData)
    return data
  } catch (e) { throw parseError(e) }
}

export async function updateProject(id, projectData) {
  try {
    const { data } = await client.put(`/${id}`, projectData)
    return data
  } catch (e) { throw parseError(e) }
}

export async function deleteProject(id) {
  try {
    await client.delete(`/${id}`)
  } catch (e) { throw parseError(e) }
}

export async function updateProjectStatus(id, status) {
  try {
    const { data } = await client.patch(`/${id}/status`, { status })
    return data
  } catch (e) { throw parseError(e) }
}

// ── Asignación de empleado ────────────────────────────────────────────────────

export async function assignEmployee(id, employeeId, employeeName) {
  try {
    const { data } = await client.patch(`/${id}/assign`, { employeeId, employeeName })
    return data
  } catch (e) { throw parseError(e) }
}

export async function unassignEmployee(id) {
  try {
    const { data } = await client.delete(`/${id}/assign`)
    return data
  } catch (e) { throw parseError(e) }
}

// ── Notas de avance ───────────────────────────────────────────────────────────

export async function getNotes(id) {
  try {
    const { data } = await client.get(`/${id}/notes`)
    return data
  } catch (e) { throw parseError(e) }
}

export async function addNote(id, content) {
  try {
    const { data } = await client.post(`/${id}/notes`, { content })
    return data
  } catch (e) { throw parseError(e) }
}

export async function reviewNote(id, noteId, reviewData) {
  try {
    const { data } = await client.patch(`/${id}/notes/${noteId}/review`, reviewData)
    return data
  } catch (e) { throw parseError(e) }
}