import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NotificationsView from '../NotificationsView.jsx'
import { getProjects } from '../../../services/projectService.js'
import { getNotifications, markAsRead } from '../../../services/notifService.js'

vi.mock('../../../services/projectService.js', () => ({
  getProjects: vi.fn(),
}))

vi.mock('../../../services/notifService.js', () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
}))

describe('NotificationsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar el título mientras carga la lista de proyectos', () => {
    getProjects.mockReturnValue(new Promise(() => {}))

    render(<NotificationsView />)

    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
  })

  it('debe seleccionar el primer proyecto y renderizar sus notificaciones', async () => {
    getProjects.mockResolvedValue([{ id: 1, name: 'Portal Retail' }])
    getNotifications.mockResolvedValue([
      { id: 100, message: 'Nueva nota de avance agregada', read: false, createdAt: null },
    ])

    render(<NotificationsView />)

    await waitFor(() => {
      expect(screen.getByText('Nueva nota de avance agregada')).toBeInTheDocument()
    })
    expect(getNotifications).toHaveBeenCalledWith(1)
  })

  it('debe mostrar el estado vacío cuando no hay proyectos disponibles', async () => {
    getProjects.mockResolvedValue([])

    render(<NotificationsView />)

    await waitFor(() => {
      expect(screen.getByText('Sin proyectos disponibles')).toBeInTheDocument()
    })
    expect(getNotifications).not.toHaveBeenCalled()
  })

  it('debe mostrar el estado vacío cuando el proyecto seleccionado no tiene notificaciones', async () => {
    getProjects.mockResolvedValue([{ id: 1, name: 'Portal Retail' }])
    getNotifications.mockResolvedValue([])

    render(<NotificationsView />)

    await waitFor(() => {
      expect(screen.getByText(/No hay notificaciones para este proyecto/i)).toBeInTheDocument()
    })
  })
})