import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import KpiView from '../KpiView.jsx'
import { getSummary } from '../../../services/analiticaService.js'

vi.mock('../../../services/analiticaService.js', () => ({
  getSummary: vi.fn(),
}))

describe('KpiView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar el spinner de carga mientras obtiene el resumen de KPIs', () => {
    getSummary.mockReturnValue(new Promise(() => {}))

    render(<KpiView />)

    expect(screen.getByText('Métricas y KPIs')).toBeInTheDocument()
  })

  it('debe renderizar las métricas una vez resuelto el fetch', async () => {
    getSummary.mockResolvedValue({
      totalProjects: 5,
      activeProjects: 2,
      completedProjects: 3,
      averageCompletion: 75,
      metrics: [],
    })

    render(<KpiView />)

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    expect(getSummary).toHaveBeenCalledTimes(1)
  })

  it('debe mostrar un banner de error si el fetch falla', async () => {
    getSummary.mockRejectedValue({ message: 'Error cargando métricas' })

    render(<KpiView />)

    await waitFor(() => {
      expect(screen.getByText(/Error cargando métricas/i)).toBeInTheDocument()
    })
  })
})