import { useState } from 'react'
import { T } from './tokens.js'

export const Spinner = ({ size = 20, color = T.color.brand }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid ${color}30`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'innovatech-spin 0.7s linear infinite',
  }}/>
)

export const StatusBadge = ({ status }) => {
  const map = {
    PLANNING:    { bg:'rgba(59,130,246,0.1)',  color:'#3b82f6', label:'Planificación' },
    IN_PROGRESS: { bg:'rgba(245,158,11,0.1)',  color:'#f59e0b', label:'En Progreso'   },
    COMPLETED:   { bg:'rgba(16,185,129,0.1)',  color:'#10b981', label:'Completado'    },
    ON_HOLD:     { bg:'rgba(100,116,139,0.1)', color:'#64748b', label:'En Pausa'      },
    CANCELLED:   { bg:'rgba(239,68,68,0.1)',   color:'#ef4444', label:'Cancelado'     },
  }
  const cfg = map[status] || { bg:'rgba(100,116,139,0.1)', color:'#64748b', label: status }
  return (
    <span style={{
      display:'inline-block', padding:'2px 10px', borderRadius:99,
      fontSize:12, fontWeight:600, background:cfg.bg, color:cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

export const StatCard = ({ label, value, sub, accent = T.color.brand, loading }) => (
  <div style={{
    background:T.color.surface, border:`1px solid ${T.color.border}`,
    borderRadius:T.radius.md, padding:'20px 24px',
    boxShadow:T.shadow.sm, position:'relative', overflow:'hidden',
  }}>
    <div style={{
      position:'absolute', top:0, left:0, width:4,
      height:'100%', background:accent, borderRadius:'4px 0 0 4px',
    }}/>
    <p style={{ margin:0, fontSize:12, fontWeight:600, color:T.color.textMuted,
                textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
    {loading
      ? <div style={{ marginTop:12 }}><Spinner size={24} color={accent}/></div>
      : (
        <>
          <p style={{ margin:'8px 0 4px', fontSize:32, fontWeight:700,
                      color:T.color.textPrimary, lineHeight:1 }}>{value ?? '—'}</p>
          {sub && <p style={{ margin:0, fontSize:13, color:T.color.textMuted }}>{sub}</p>}
        </>
      )
    }
  </div>
)

/** Modal overlay */
export const Modal = ({ title, onClose, children, width = '520px' }) => (
  <div style={{
    position:'fixed', inset:0, background:'rgba(15,23,42,0.55)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:1000, padding:16,
  }}>
    <div style={{
      background:T.color.surface, borderRadius:T.radius.lg,
      border:`1px solid ${T.color.border}`, width, maxWidth:'100%',
      maxHeight:'90vh', overflowY:'auto', padding:28,
      boxShadow:T.shadow.lg,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:T.color.textPrimary }}>{title}</h3>
        <button onClick={onClose} style={{
          background:'none', border:'none', color:T.color.textMuted,
          fontSize:22, cursor:'pointer', lineHeight:1, padding:'2px 6px',
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
)

export const Btn = ({ children, onClick, type = 'button', disabled, variant = 'primary' }) => {
  const vs = {
    primary: { background:T.color.brand,   color:'#fff'                  },
    danger:  { background:T.color.error,   color:'#fff'                  },
    ghost:   { background:'transparent',   color:T.color.textSecondary,
               border:`1px solid ${T.color.border}`                      },
    success: { background:T.color.success, color:'#fff'                  },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...vs[variant],
      padding:'7px 16px', borderRadius:T.radius.sm,
      border: vs[variant].border || 'none',
      fontSize:13, fontWeight:600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      transition:'opacity .15s',
    }}>
      {children}
    </button>
  )
}

export const FieldRow = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:600,
                    color:T.color.textMuted, marginBottom:5,
                    textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {label}
    </label>
    {children}
  </div>
)

export const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
    width:'100%', padding:'8px 12px', borderRadius:T.radius.sm,
    border:`1px solid ${T.color.border}`, fontSize:14,
    color:T.color.textPrimary, background:T.color.surface,
    outline:'none', boxSizing:'border-box',
  }}/>
)

export const SelectInput = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={onChange} style={{
    width:'100%', padding:'8px 12px', borderRadius:T.radius.sm,
    border:`1px solid ${T.color.border}`, fontSize:14,
    color:T.color.textPrimary, background:T.color.surface,
    outline:'none', boxSizing:'border-box', cursor:'pointer',
  }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

export const ErrorBanner = ({ message, onRetry }) => (
  <div style={{
    padding:'10px 16px', borderRadius:T.radius.sm,
    background:'rgba(239,68,68,0.06)', border:`1px solid rgba(239,68,68,0.2)`,
    color:T.color.error, fontSize:13, marginBottom:16,
    display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
  }}>
    <span>⚠ {message}</span>
    {onRetry && <Btn onClick={onRetry} variant="ghost">Reintentar</Btn>}
  </div>
)