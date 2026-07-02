import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResourcesView from '../ResourcesView.jsx'
import { getResources, getAvailableResources } from '../../../services/resourceService.js'

vi.mock('../../../services/resourceService.js', () => ({
  getResources: vi.fn(),
  getAvailableResources: vi.fn(),
  createResource: vi.fn(),
  deleteResource: vi.fn(),
  updateAvailability: vi.fn(),
}))

const ADMIN_USER = { id: 1, name: 'Admin', role: 'ADMIN' }

describe('ResourcesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar el título y el estado de carga inicial', () => {
    getResources.mockReturnValue(new Promise(() => {}))
    getAvailableResources.mockReturnValue(new Promise(() => {}))

    render(<ResourcesView user={ADMIN_USER} />)

    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument()
  })

  it('debe renderizar la lista de recursos una vez resuelto el fetch', async () => {
    getResources.mockResolvedValue([
      { id: 1, name: 'Benjamín Valdés', email: 'benjamin@innovatech.cl', department: 'Engineering', role: 'DEVELOPER', available: true },
    ])
    getAvailableResources.mockResolvedValue([
      { id: 1, name: 'Benjamín Valdés', available: true },
    ])

    render(<ResourcesView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText('Benjamín Valdés')).toBeInTheDocument()
    })
    expect(getResources).toHaveBeenCalledTimes(1)
    expect(getAvailableResources).toHaveBeenCalledTimes(1)
  })

  it('debe mostrar el estado vacío cuando no hay recursos', async () => {
    getResources.mockResolvedValue([])
    getAvailableResources.mockResolvedValue([])

    render(<ResourcesView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText(/No hay recursos registrados/i)).toBeInTheDocument()
    })
  })

  it('debe mostrar un banner de error si el fetch de recursos falla', async () => {
    getResources.mockRejectedValue({ message: 'Error al cargar recursos' })
    getAvailableResources.mockRejectedValue({ message: 'Error al cargar recursos' })

    render(<ResourcesView user={ADMIN_USER} />)

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar recursos/i)).toBeInTheDocument()
    })
  })
})