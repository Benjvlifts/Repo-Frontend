import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { T } from './dashboard/tokens.js'
import ProjectsView      from './dashboard/ProjectsView.jsx'
import ResourcesView     from './dashboard/ResourcesView.jsx'
import KpiView           from './dashboard/KpiView.jsx'
import NotificationsView from './dashboard/NotificationsView.jsx'

const NAV_ITEMS = [
  {
    id:'proyectos', label:'Proyectos', roles:['ADMIN','MANAGER','EMPLOYEE'],
    icon:(<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
    </svg>),
  },
  {
    id:'recursos', label:'Recursos Humanos', roles:['ADMIN','MANAGER'],
    icon:(<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H2v-2a4 4 0 013-3.87m12-5.13a4 4 0 11-8 0 4 4 0 018 0zM7 8a4 4 0 110 8 4 4 0 010-8z"/>
    </svg>),
  },
  {
    id:'kpis', label:'Métricas / KPIs', roles:['ADMIN','MANAGER'],
    icon:(<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M3 3v18h18"/><path d="M18 9l-5 5-2-2-4 4"/>
    </svg>),
  },
  {
    id:'notificaciones', label:'Notificaciones', roles:['ADMIN','MANAGER','EMPLOYEE'],
    icon:(<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-4.993M9 17H4l1.405-1.405A2.032 2.032 0 006 14.158V11a6 6 0 016-6"/>
      <path d="M13 21a1 1 0 01-2 0"/>
    </svg>),
  },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [activeView, setActiveView] = useState('proyectos')

  useEffect(() => {
    if (!user) navigate('/login', { replace:true })
  }, [user, navigate])

  if (!user) return null

  const role        = user.role || 'EMPLOYEE'
  const roleConfig  = T.color[`role${role[0]}${role.slice(1).toLowerCase()}`] || T.color.roleEmployee
  const roleLabel   = { ADMIN:'Administrador', MANAGER:'Manager', EMPLOYEE:'Empleado' }[role] || role
  const visibleItems= NAV_ITEMS.filter(it => it.roles.includes(role))
  const currentItem = visibleItems.find(it => it.id === activeView) || visibleItems[0]

  const handleLogout = () => { logout(); navigate('/login', { replace:true }) }

  const sidebarItemStyle = (id) => ({
    display:'flex', alignItems:'center', gap:12,
    padding:'10px 16px', margin:'1px 10px',
    borderRadius:T.radius.sm,
    cursor:'pointer', fontSize:14, fontWeight:500,
    border:'none', width:'calc(100% - 20px)', textAlign:'left',
    transition:'background 0.12s, color 0.12s',
    ...(currentItem.id === id ? {
      background:T.color.sidebarActiveBg,
      color:T.color.sidebarActive,
      boxShadow:`inset 3px 0 0 ${T.color.sidebarActiveBar}`,
    } : {
      background:'transparent',
      color:T.color.sidebarText,
    }),
  })

  const renderView = () => {
    switch (currentItem.id) {
      case 'proyectos':      return <ProjectsView      user={user}/>
      case 'recursos':       return <ResourcesView     user={user}/>
      case 'kpis':           return <KpiView/>
      case 'notificaciones': return <NotificationsView/>
      default:               return <ProjectsView      user={user}/>
    }
  }

  return (
    <>
      <style>{`
        @keyframes innovatech-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
        button:hover { opacity:.88; }
      `}</style>

      <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:T.color.bg }}>

        {/* SIDEBAR */}
        <aside style={{
          width:T.sidebar.width, minWidth:T.sidebar.width,
          background:T.color.sidebarBg,
          display:'flex', flexDirection:'column',
          height:'100vh', position:'sticky', top:0, overflowY:'auto',
        }}>
          {/* Logo */}
          <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${T.color.sidebarBorder}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:34, height:34, borderRadius:T.radius.sm,
                background:`linear-gradient(135deg,${T.color.brand},${T.color.brandDark})`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', lineHeight:1.2 }}>Innovatech</div>
                <div style={{ fontSize:11, color:T.color.sidebarText, lineHeight:1.2 }}>Solutions</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'12px 0' }}>
            <div style={{ padding:'6px 20px 8px', fontSize:10, fontWeight:700,
                          color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Principal
            </div>
            {visibleItems.map(item => (
              <button key={item.id} onClick={() => setActiveView(item.id)} style={sidebarItemStyle(item.id)}>
                <span style={{ flexShrink:0, display:'flex' }}>{item.icon}</span>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User card */}
          <div style={{ padding:'16px 18px', borderTop:`1px solid ${T.color.sidebarBorder}`, marginTop:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background:`linear-gradient(135deg,${T.color.brand},${T.color.brandDark})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, fontWeight:700, color:'#fff', flexShrink:0,
              }}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#cbd5e1',
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize:11, color:T.color.sidebarText,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              width:'100%', background:'rgba(239,68,68,0.1)', color:'#f87171',
              border:'1px solid rgba(239,68,68,0.2)', borderRadius:T.radius.sm,
              padding:'7px 12px', fontSize:13, fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Header */}
          <header style={{
            height:T.header.height, background:T.color.surface,
            borderBottom:`1px solid ${T.color.border}`,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 32px', flexShrink:0, boxShadow:'0 1px 0 rgba(0,0,0,0.06)',
          }}>
            <div>
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:T.color.textPrimary }}>{currentItem.label}</h2>
              <p style={{ margin:0, fontSize:12, color:T.color.textMuted }}>Innovatech Solutions — Plataforma Integrada</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{
                padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:600,
                background:roleConfig.bg, color:roleConfig.color, border:`1px solid ${roleConfig.border}`,
              }}>
                {roleLabel}
              </span>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background:`linear-gradient(135deg,${T.color.brand},${T.color.brandDark})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, fontWeight:700, color:'#fff',
              }}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex:1, overflowY:'auto', padding:32 }}>
            {renderView()}
          </main>
        </div>
      </div>
    </>
  )
}