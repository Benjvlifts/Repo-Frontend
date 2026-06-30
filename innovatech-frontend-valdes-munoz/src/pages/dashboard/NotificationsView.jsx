import { useState, useEffect, useCallback } from 'react'
import { getProjects } from '../../services/projectService.js'
import { getNotifications, markAsRead } from '../../services/notifService.js'
import { T } from './tokens.js'
import { Spinner } from './atoms.jsx'

export default function NotificationsView() {
  const [projects,       setProjects]       = useState([])
  const [selectedId,     setSelectedId]     = useState(null)
  const [notifications,  setNotifications]  = useState([])
  const [loadingProj,    setLoadingProj]    = useState(true)
  const [loadingNotif,   setLoadingNotif]   = useState(false)

  useEffect(() => {
    getProjects()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setProjects(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingProj(false))   // BUG 2 FIX
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingNotif(true)
    getNotifications(selectedId)
      .then(d => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotif(false))   // BUG 2 FIX
  }, [selectedId])

  const handleMarkRead = useCallback(async (id) => {
    await markAsRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read:true } : n))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:T.color.textPrimary }}>Notificaciones</h1>
        <p style={{ margin:'4px 0 0', color:T.color.textSecondary, fontSize:14 }}>
          Alertas generadas por eventos en los proyectos.
        </p>
      </div>

      {/* Selector de proyecto */}
      <div style={{ background:T.color.surface, border:`1px solid ${T.color.border}`,
                    borderRadius:T.radius.md, padding:'16px 24px',
                    boxShadow:T.shadow.sm, marginBottom:20,
                    display:'flex', alignItems:'center', gap:16 }}>
        <label style={{ fontSize:14, fontWeight:600, color:T.color.textPrimary, whiteSpace:'nowrap' }}>Proyecto:</label>
        {loadingProj ? <Spinner size={18}/> : (
          <select
            value={selectedId || ''}
            onChange={e => setSelectedId(Number(e.target.value))}
            style={{
              flex:1, maxWidth:360, padding:'8px 12px', borderRadius:T.radius.sm,
              border:`1px solid ${T.color.border}`, fontSize:14,
              color:T.color.textPrimary, background:T.color.surface, outline:'none', cursor:'pointer',
            }}
          >
            {projects.length === 0
              ? <option value="">Sin proyectos disponibles</option>
              : projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
            }
          </select>
        )}
        {unreadCount > 0 && (
          <span style={{
            background:T.color.error, color:'#fff', borderRadius:99,
            fontSize:12, fontWeight:700, padding:'2px 9px',
          }}>
            {unreadCount} sin leer
          </span>
        )}
      </div>

      {/* Lista */}
      <div style={{ background:T.color.surface, border:`1px solid ${T.color.border}`,
                    borderRadius:T.radius.md, boxShadow:T.shadow.sm, overflow:'hidden' }}>
        {loadingNotif ? (
          <div style={{ padding:48, display:'flex', justifyContent:'center' }}><Spinner/></div>
        ) : notifications.length === 0 ? (
          <div style={{ padding:48, textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🔔</div>
            <p style={{ color:T.color.textMuted, fontSize:14, margin:0 }}>
              No hay notificaciones para este proyecto.
            </p>
          </div>
        ) : (
          <ul style={{ margin:0, padding:0, listStyle:'none' }}>
            {notifications.map((n, i) => (
              <li key={n.id} style={{
                padding:'14px 24px', borderTop: i>0 ? `1px solid ${T.color.border}` : 'none',
                display:'flex', alignItems:'flex-start', gap:14,
                background: n.read ? T.color.surface : `${T.color.brand}08`,
              }}>
                <div style={{
                  width:9, height:9, borderRadius:'50%', marginTop:5, flexShrink:0,
                  background: n.read ? T.color.border : T.color.brand,
                }}/>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14, color:T.color.textPrimary, lineHeight:1.5 }}>{n.message}</p>
                  <p style={{ margin:'3px 0 0', fontSize:12, color:T.color.textMuted }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('es-CL') : ''}
                  </p>
                </div>
                {!n.read && (
                  <button onClick={() => handleMarkRead(n.id)} style={{
                    background:'transparent', border:`1px solid ${T.color.border}`,
                    borderRadius:T.radius.sm, padding:'4px 12px', fontSize:12,
                    color:T.color.textSecondary, cursor:'pointer', whiteSpace:'nowrap',
                  }}>
                    Marcar leída
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}