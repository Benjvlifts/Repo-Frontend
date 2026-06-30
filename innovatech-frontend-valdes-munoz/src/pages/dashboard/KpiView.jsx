import { useState, useEffect } from 'react'
import { getSummary } from '../../services/analiticaService.js'
import { T } from './tokens.js'
import { Spinner, StatCard, StatusBadge, ErrorBanner } from './atoms.jsx'

export default function KpiView() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchSummary = async () => {
    setLoading(true); setError(null)
    try { setSummary(await getSummary()) }
    catch (err) { setError(err?.message || 'Error cargando métricas') }
    finally { setLoading(false) }   // BUG 2 FIX
  }

  useEffect(() => { fetchSummary() }, [])

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:T.color.textPrimary }}>Métricas y KPIs</h1>
        <p style={{ margin:'4px 0 0', color:T.color.textSecondary, fontSize:14 }}>
          Indicadores de desempeño organizacional en tiempo real.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchSummary}/>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard label="Total proyectos"     value={summary?.totalProjects}    loading={loading} accent={T.color.brand}   />
        <StatCard label="Completitud prom."   value={summary ? `${(summary.averageCompletion??0).toFixed(1)}%` : null}
                  loading={loading} accent={T.color.success}/>
        <StatCard label="Proyectos activos"   value={summary?.activeProjects}   loading={loading} accent={T.color.warning} />
        <StatCard label="Completados"         value={summary?.completedProjects} loading={loading} accent={T.color.info}   />
      </div>

      {!loading && summary?.metrics?.length > 0 && (
        <div style={{ background:T.color.surface, border:`1px solid ${T.color.border}`,
                      borderRadius:T.radius.md, boxShadow:T.shadow.sm, overflow:'hidden' }}>
          <div style={{ padding:'14px 24px', borderBottom:`1px solid ${T.color.border}` }}>
            <span style={{ fontWeight:600, fontSize:15, color:T.color.textPrimary }}>Métricas por Proyecto</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:T.color.bg }}>
                  {['Proyecto','Estado','Completitud','Tareas Activas','Última Actualización'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:12,
                                         fontWeight:600, color:T.color.textMuted,
                                         textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.metrics.map((m, i) => (
                  <tr key={m.projectId} style={{
                    borderTop:`1px solid ${T.color.border}`,
                    background: i % 2 === 0 ? T.color.surface : '#fafafa',
                  }}>
                    <td style={{ padding:'11px 16px', fontWeight:500, color:T.color.textPrimary }}>#{m.projectId}</td>
                    <td style={{ padding:'11px 16px' }}><StatusBadge status={m.projectStatus}/></td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ flex:1, height:6, background:T.color.bg, borderRadius:99, overflow:'hidden' }}>
                          <div style={{
                            height:'100%', borderRadius:99,
                            width:`${m.completionPercentage ?? 0}%`,
                            background: (m.completionPercentage??0)>=80 ? T.color.success
                                      : (m.completionPercentage??0)>=40 ? T.color.warning
                                      : T.color.error,
                          }}/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, minWidth:36 }}>
                          {(m.completionPercentage??0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 16px', color:T.color.textSecondary }}>{m.activeTasks}</td>
                    <td style={{ padding:'11px 16px', color:T.color.textMuted, fontSize:12 }}>
                      {m.lastUpdated ? new Date(m.lastUpdated).toLocaleDateString('es-CL') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}