import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectsView from '../ProjectsView.jsx'
import { getProjects } from '../../../services/projectService.js'
import { getEmployees } from '../../../services/authService.js'

vi.mock('../../../services/projectService.js', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  assignEmployee: vi.fn(),
  unassignEmployee: vi.fn(),
  getNotes: vi.fn(),
  addNote: vi.fn(),
  reviewNote: vi.fn(),
}))

vi.mock('../../../services/authService.js', () => ({
  getEmployees: vi.fn(),
}))

const ADMIN_USER = { id: 1, name: 'Admin', role: 'ADMIN' }

describe('ProjectsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEmployees.mockResolvedValue([])
  })

  it('debe mostrar el título y el estado de carga inicial', () => {
    getProjects.mockReturnValue(new Promise(() => {}))

    render(<ProjectsView user={ADMIN_USER} />)

    expect(screen.getByText('Gestión de Proyectos')).toBeInTheDocument()
  })

  it('debe renderizar la lista de proyectos una vez resuelto el fetch', async () => {
    getProjects.mockResolvedValue([
      { id: 1, name: 'Portal Retail', type: 'SOFTWARE', status: 'PLANNING', assignedUserName: null },
    ])

    render(<ProjectsView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText('Portal Retail')).toBeInTheDocument()
    })
    expect(getProjects).toHaveBeenCalledTimes(1)
  })

  it('debe mostrar el estado vacío cuando no hay proyectos', async () => {
    getProjects.mockResolvedValue([])

    render(<ProjectsView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText(/No hay proyectos/i)).toBeInTheDocument()
    })
  })

  it('debe mostrar un banner de error si el fetch de proyectos falla', async () => {
    getProjects.mockRejectedValue({ message: 'Error al cargar proyectos' })

    render(<ProjectsView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar proyectos/i)).toBeInTheDocument()
    })
  })
})