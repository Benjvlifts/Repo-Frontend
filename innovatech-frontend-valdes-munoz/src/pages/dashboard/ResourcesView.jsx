import { useState, useEffect, useCallback } from 'react'
import {
  getResources, getAvailableResources,
  createResource, deleteResource, updateAvailability,
} from '../../services/resourceService.js'
import { T } from './tokens.js'
import { Spinner, StatCard, Modal, Btn, FieldRow, TextInput, SelectInput, ErrorBanner } from './atoms.jsx'

const DEPARTMENTS = ['Engineering', 'Design', 'QA', 'DevOps', 'Management', 'Consulting']
const ROLES       = ['DEVELOPER', 'DESIGNER', 'QA', 'DEVOPS', 'MANAGER', 'CONSULTANT']

const ROLE_COLOR = {
  DEVELOPER:'#6366f1', DESIGNER:'#ec4899',
  QA:'#f59e0b',        DEVOPS:'#14b8a6',
  MANAGER:'#8b5cf6',   CONSULTANT:'#f97316',
}

export default function ResourcesView({ user }) {
  const isAdmin = user?.role === 'ADMIN'

  const [resources,  setResources]  = useState([])
  const [available,  setAvailable]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [modal,      setModal]      = useState(null)   // null | 'create'
  const [form,       setForm]       = useState({})
  const [formError,  setFormError]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [all, avail] = await Promise.all([getResources(), getAvailableResources()])
      setResources(Array.isArray(all) ? all : [])
      setAvailable(Array.isArray(avail) ? avail : [])
    } catch (err) {
      setError(err?.message || 'Error al cargar recursos')
      setResources([]); setAvailable([])
    } finally { setLoading(false) }      // BUG 2 FIX: finally garantiza que loading se apaga
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => {
    setForm({ name:'', email:'', department: DEPARTMENTS[0], role:'DEVELOPER' })
    setFormError(null); setModal('create')
  }
  const closeModal = () => { setModal(null); setFormError(null); setForm({}) }

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError(null)
    try { await createResource(form); closeModal(); fetchAll() }
    catch (err) { setFormError(err?.message || 'Error al crear recurso') }
    finally { setSubmitting(false) }
  }

  const handleToggleAvailability = async (r) => {
    try { await updateAvailability(r.id, !r.available); fetchAll() }
    catch { /* silent */ }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`¿Eliminar a "${r.name}"?`)) return
    try { await deleteResource(r.id); fetchAll() }
    catch { /* silent */ }
  }

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const inputStyle = {
    width:'100%', padding:'8px 12px', borderRadius:T.radius.sm,
    border:`1px solid ${T.color.border}`, fontSize:14,
    color:T.color.textPrimary, background:T.color.surface,
    outline:'none', boxSizing:'border-box',
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:T.color.textPrimary }}>Recursos Humanos</h1>
          <p style={{ margin:'4px 0 0', color:T.color.textSecondary, fontSize:14 }}>Disponibilidad y asignación del equipo.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {isAdmin && (
            <button onClick={openCreate} style={{
              background:T.color.brand, color:'#fff', border:'none',
              padding:'8px 16px', borderRadius:T.radius.sm, fontSize:13, fontWeight:600, cursor:'pointer',
            }}>
              + Nuevo Recurso
            </button>
          )}
          <button onClick={fetchAll} style={{
            background:'transparent', color:T.color.textSecondary,
            border:`1px solid ${T.color.border}`, padding:'8px 14px',
            borderRadius:T.radius.sm, fontSize:13, cursor:'pointer',
          }}>
            ↺ Actualizar
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
        <StatCard label="Total"       value={resources.length}                     loading={loading} accent={T.color.brand}   />
        <StatCard label="Disponibles" value={available.length}                     loading={loading} accent={T.color.success} />
        <StatCard label="Asignados"   value={resources.length - available.length}  loading={loading} accent={T.color.warning} />
        <StatCard label="Ocupación"
          value={resources.length > 0 ? `${Math.round((1-available.length/resources.length)*100)}%` : '—'}
          loading={loading} accent={T.color.info}/>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchAll}/>}

      <div style={{ background:T.color.surface, border:`1px solid ${T.color.border}`,
                    borderRadius:T.radius.md, boxShadow:T.shadow.sm, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, display:'flex', justifyContent:'center' }}><Spinner/></div>
        ) : resources.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:T.color.textMuted }}>
            <div style={{ fontSize:36, marginBottom:10 }}>👥</div>
            No hay recursos registrados.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:T.color.bg }}>
                  {['Nombre','Email','Departamento','Rol','Estado','Acciones'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:12,
                                         fontWeight:600, color:T.color.textMuted,
                                         textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => (
                  <tr key={r.id} style={{
                    borderTop:`1px solid ${T.color.border}`,
                    background: i % 2 === 0 ? T.color.surface : '#fafafa',
                  }}>
                    <td style={{ padding:'11px 16px', fontWeight:600, color:T.color.textPrimary, fontSize:14 }}>{r.name}</td>
                    <td style={{ padding:'11px 16px', color:T.color.textSecondary, fontSize:13 }}>{r.email}</td>
                    <td style={{ padding:'11px 16px', color:T.color.textSecondary, fontSize:13 }}>{r.department}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{
                        display:'inline-block', padding:'2px 10px', borderRadius:99,
                        fontSize:12, fontWeight:600,
                        background:`${ROLE_COLOR[r.role]||T.color.brand}18`,
                        color: ROLE_COLOR[r.role] || T.color.brand,
                      }}>
                        {r.role}
                      </span>
                    </td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:6,
                        fontSize:13, fontWeight:500,
                        color: r.available ? T.color.success : T.color.warning,
                      }}>
                        <span style={{
                          width:8, height:8, borderRadius:'50%',
                          background: r.available ? T.color.success : T.color.warning,
                        }}/>
                        {r.available ? 'Disponible' : 'Asignado'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {isAdmin && (
                          <>
                            <Btn onClick={() => handleToggleAvailability(r)} variant="ghost">
                              {r.available ? '🔒 Asignar' : '🔓 Liberar'}
                            </Btn>
                            <Btn onClick={() => handleDelete(r)} variant="danger">🗑</Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Recurso */}
      {modal === 'create' && (
        <Modal title="Nuevo Recurso" onClose={closeModal}>
          <form onSubmit={handleCreate}>
            <FieldRow label="Nombre *"><TextInput value={form.name} onChange={setF('name')} placeholder="Nombre completo"/></FieldRow>
            <FieldRow label="Email *"><TextInput value={form.email} onChange={setF('email')} placeholder="correo@empresa.cl" type="email"/></FieldRow>
            <FieldRow label="Departamento">
              <SelectInput value={form.department} onChange={setF('department')}
                options={DEPARTMENTS.map(d => ({ value:d, label:d }))}/>
            </FieldRow>
            <FieldRow label="Rol">
              <SelectInput value={form.role} onChange={setF('role')}
                options={ROLES.map(r => ({ value:r, label:r }))}/>
            </FieldRow>
            {formError && <p style={{ color:T.color.error, fontSize:13, marginBottom:12 }}>⚠ {formError}</p>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
              <Btn type="submit" disabled={submitting}>{submitting ? 'Creando…' : 'Crear Recurso'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}