import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getProjects, createProject, updateProject, deleteProject,
  updateProjectStatus, assignEmployee, unassignEmployee,
  getNotes, addNote, reviewNote,
} from '../../services/projectService.js'
import { getEmployees } from '../../services/authService.js'
import { T } from './tokens.js'
import { Spinner, StatusBadge, StatCard, Modal, Btn, FieldRow, TextInput, SelectInput, ErrorBanner } from './atoms.jsx'

const TYPES    = ['SOFTWARE', 'CONSULTING', 'INFRASTRUCTURE']
const STATUSES = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
const STATUS_LABELS = {
  PLANNING:'Planificación', IN_PROGRESS:'En Progreso',
  ON_HOLD:'En Pausa', COMPLETED:'Completado', CANCELLED:'Cancelado',
}

export default function ProjectsView({ user }) {
  const isAdmin   = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER' || isAdmin

  const [projects,     setProjects]     = useState([])
  const [employees,    setEmployees]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  // modal: null | 'create' | 'edit' | 'assign' | 'notes'
  const [modal,        setModal]        = useState(null)
  const [activeProj,   setActiveProj]   = useState(null)
  const [form,         setForm]         = useState({})
  const [formError,    setFormError]    = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  const [notes,        setNotes]        = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNote,      setNewNote]      = useState('')

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const data = await getProjects(params)
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Error al cargar proyectos')
      setProjects([])
    } finally { setLoading(false) }       // BUG 2 FIX: finally garantiza que loading se apaga
  }, [filterStatus])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const fetchEmployees = async () => {
    try { setEmployees(Array.isArray(await getEmployees()) ? await getEmployees() : []) }
    catch { setEmployees([]) }
  }

  const fetchNotes = async (projectId) => {
    setNotesLoading(true)
    try { setNotes(Array.isArray(await getNotes(projectId)) ? await getNotes(projectId) : []) }
    catch { setNotes([]) }
    finally { setNotesLoading(false) }
  }

  // ── Modal helpers ────────────────────────────────────────────────────────
  const closeModal = () => { setModal(null); setActiveProj(null); setFormError(null); setForm({}) }

  const openCreate = () => {
    setForm({ name:'', description:'', type:'SOFTWARE', managerId: user?.id ?? '' })
    setFormError(null); setModal('create')
  }

  const openEdit = (p) => {
    setActiveProj(p)
    setForm({ name:p.name||'', description:p.description||'', type:p.type||'SOFTWARE' })
    setFormError(null); setModal('edit')
  }

  const openAssign = async (p) => {
    setActiveProj(p)
    setForm({ employeeId: p.assignedUserId ?? '' })
    setFormError(null)
    await fetchEmployees()
    setModal('assign')
  }

  const openNotes = async (p) => {
    setActiveProj(p); setNewNote('')
    await fetchNotes(p.id); setModal('notes')
  }

  // ── Submit handlers ──────────────────────────────────────────────────────
  const withSubmit = (fn) => async (e) => {
    e?.preventDefault(); setSubmitting(true); setFormError(null)
    try { await fn(); closeModal(); fetchProjects() }
    catch (err) { setFormError(err?.message || 'Error') }
    finally { setSubmitting(false) }
  }

  const handleCreate     = withSubmit(() => createProject(form))
  const handleEdit       = withSubmit(() => updateProject(activeProj.id, form))
  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return
    try { await deleteProject(p.id); fetchProjects() } catch { /* silent */ }
  }
  const handleStatusChange = async (p, st) => {
    try { await updateProjectStatus(p.id, st); fetchProjects() } catch { /* silent */ }
  }
  const handleAssign = withSubmit(async () => {
    if (form.employeeId) {
      const emp = employees.find(e => String(e.id) === String(form.employeeId))
      await assignEmployee(activeProj.id, form.employeeId, emp?.name ?? '')
    } else {
      await unassignEmployee(activeProj.id)
    }
  })
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setSubmitting(true)
    try { await addNote(activeProj.id, newNote.trim()); setNewNote(''); await fetchNotes(activeProj.id) }
    catch { /* silent */ } finally { setSubmitting(false) }
  }
  const handleReviewNote = async (noteId, status) => {
    try { await reviewNote(activeProj.id, noteId, { status, reviewComment:'' }); await fetchNotes(activeProj.id) }
    catch { /* silent */ }
  }

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const stats = {
    total:      projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed:  projects.filter(p => p.status === 'COMPLETED').length,
    planning:   projects.filter(p => p.status === 'PLANNING').length,
  }

  const inputStyle = {
    width:'100%', padding:'8px 12px', borderRadius:T.radius.sm,
    border:`1px solid ${T.color.border}`, fontSize:14,
    color:T.color.textPrimary, background:T.color.surface,
    outline:'none', boxSizing:'border-box',
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:T.color.textPrimary }}>Gestión de Proyectos</h1>
          <p style={{ margin:'4px 0 0', color:T.color.textSecondary, fontSize:14 }}>Planificación, ejecución y seguimiento.</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width:'auto' }}
          >
            <option value="">Todos los estados</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          {isManager && (
            <button onClick={openCreate} style={{
              background:T.color.brand, color:'#fff', border:'none',
              padding:'8px 16px', borderRadius:T.radius.sm, fontSize:13, fontWeight:600, cursor:'pointer',
            }}>
              + Nuevo Proyecto
            </button>
          )}
          <button onClick={fetchProjects} style={{
            background:'transparent', color:T.color.textSecondary,
            border:`1px solid ${T.color.border}`, padding:'8px 14px',
            borderRadius:T.radius.sm, fontSize:13, cursor:'pointer',
          }}>
            ↺ Actualizar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
        <StatCard label="Total"        value={stats.total}      loading={loading} accent={T.color.brand}   />
        <StatCard label="En progreso"  value={stats.inProgress} loading={loading} accent={T.color.warning} />
        <StatCard label="Completados"  value={stats.completed}  loading={loading} accent={T.color.success} />
        <StatCard label="Planificación"value={stats.planning}   loading={loading} accent={T.color.info}    />
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects}/>}

      {/* Table */}
      <div style={{ background:T.color.surface, border:`1px solid ${T.color.border}`,
                    borderRadius:T.radius.md, boxShadow:T.shadow.sm, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, display:'flex', justifyContent:'center' }}><Spinner/></div>
        ) : projects.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:T.color.textMuted }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
            No hay proyectos{filterStatus ? ` con estado "${STATUS_LABELS[filterStatus]}"` : ''}.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:T.color.bg }}>
                  {['#','Nombre','Tipo','Estado','Asignado a','Acciones'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:12,
                                         fontWeight:600, color:T.color.textMuted,
                                         textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.id} style={{
                    borderTop:`1px solid ${T.color.border}`,
                    background: i % 2 === 0 ? T.color.surface : '#fafafa',
                  }}>
                    <td style={{ padding:'11px 16px', color:T.color.textMuted, fontSize:13 }}>#{p.id}</td>
                    <td style={{ padding:'11px 16px', fontWeight:600, color:T.color.textPrimary, fontSize:14 }}>{p.name}</td>
                    <td style={{ padding:'11px 16px', color:T.color.textSecondary, fontSize:13 }}>{p.type}</td>
                    <td style={{ padding:'11px 16px' }}>
                      {isManager ? (
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p, e.target.value)}
                          style={{ ...inputStyle, width:'auto', padding:'3px 8px', fontSize:12, fontWeight:600 }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={p.status}/>
                      )}
                    </td>
                    <td style={{ padding:'11px 16px', color:T.color.textSecondary, fontSize:13 }}>
                      {p.assignedUserName || <span style={{ fontStyle:'italic' }}>Sin asignar</span>}
                    </td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <Btn onClick={() => openNotes(p)} variant="ghost">📋 Notas</Btn>
                        {isManager && (
                          <>
                            <Btn onClick={() => openEdit(p)} variant="ghost">✏ Editar</Btn>
                            <Btn onClick={() => openAssign(p)} variant="ghost">👤 Asignar</Btn>
                          </>
                        )}
                        {isAdmin && <Btn onClick={() => handleDelete(p)} variant="danger">🗑</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Crear ──────────────────────────────────────────────────────── */}
      {modal === 'create' && (
        <Modal title="Nuevo Proyecto" onClose={closeModal}>
          <form onSubmit={handleCreate}>
            <FieldRow label="Nombre *"><TextInput value={form.name} onChange={setF('name')} placeholder="Nombre del proyecto"/></FieldRow>
            <FieldRow label="Descripción">
              <textarea value={form.description} onChange={setF('description')} rows={3}
                style={{ ...inputStyle, resize:'vertical' }} placeholder="Descripción opcional"/>
            </FieldRow>
            <FieldRow label="Tipo *">
              <SelectInput value={form.type} onChange={setF('type')} options={TYPES.map(t => ({ value:t, label:t }))}/>
            </FieldRow>
            {formError && <p style={{ color:T.color.error, fontSize:13, marginBottom:12 }}>⚠ {formError}</p>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
              <Btn type="submit" disabled={submitting}>{submitting ? 'Creando…' : 'Crear Proyecto'}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Editar ─────────────────────────────────────────────────────── */}
      {modal === 'edit' && activeProj && (
        <Modal title={`Editar: ${activeProj.name}`} onClose={closeModal}>
          <form onSubmit={handleEdit}>
            <FieldRow label="Nombre *"><TextInput value={form.name} onChange={setF('name')} placeholder="Nombre"/></FieldRow>
            <FieldRow label="Descripción">
              <textarea value={form.description} onChange={setF('description')} rows={3}
                style={{ ...inputStyle, resize:'vertical' }}/>
            </FieldRow>
            <FieldRow label="Tipo">
              <SelectInput value={form.type} onChange={setF('type')} options={TYPES.map(t => ({ value:t, label:t }))}/>
            </FieldRow>
            {formError && <p style={{ color:T.color.error, fontSize:13, marginBottom:12 }}>⚠ {formError}</p>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
              <Btn type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Asignar ────────────────────────────────────────────────────── */}
      {modal === 'assign' && activeProj && (
        <Modal title={`Asignar empleado — ${activeProj.name}`} onClose={closeModal} width="420px">
          <form onSubmit={handleAssign}>
            <FieldRow label="Empleado">
              <SelectInput
                value={form.employeeId}
                onChange={setF('employeeId')}
                placeholder="Sin asignar"
                options={employees.map(e => ({ value: e.id, label: `${e.name || e.email}` }))}
              />
            </FieldRow>
            <p style={{ color:T.color.textMuted, fontSize:12, margin:'0 0 16px' }}>
              Selecciona "Sin asignar" para retirar la asignación actual.
            </p>
            {formError && <p style={{ color:T.color.error, fontSize:13, marginBottom:12 }}>⚠ {formError}</p>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
              <Btn type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Confirmar'}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Notas ──────────────────────────────────────────────────────── */}
      {modal === 'notes' && activeProj && (
        <Modal title={`Notas — ${activeProj.name}`} onClose={closeModal} width="600px">
          {notesLoading ? (
            <div style={{ padding:24, display:'flex', justifyContent:'center' }}><Spinner/></div>
          ) : notes.length === 0 ? (
            <p style={{ color:T.color.textMuted, textAlign:'center', fontStyle:'italic', margin:'8px 0 20px' }}>
              Sin notas de avance.
            </p>
          ) : (
            <div style={{ maxHeight:320, overflowY:'auto', marginBottom:20 }}>
              {notes.map(n => (
                <div key={n.id} style={{
                  background:T.color.bg, borderRadius:T.radius.sm,
                  border:`1px solid ${T.color.border}`, padding:14, marginBottom:10,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ color:T.color.textMuted, fontSize:12 }}>
                      {n.authorName || `#${n.authorId}`} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString('es-CL') : ''}
                    </span>
                    <StatusBadge status={n.status === 'APPROVED' ? 'COMPLETED' : n.status === 'REJECTED' ? 'CANCELLED' : 'PLANNING'}/>
                  </div>
                  <p style={{ color:T.color.textPrimary, margin:'0 0 8px', fontSize:14 }}>{n.content}</p>
                  {n.reviewComment && (
                    <p style={{ color:T.color.textMuted, fontSize:12, fontStyle:'italic', margin:'0 0 8px' }}>
                      Revisión: {n.reviewComment}
                    </p>
                  )}
                  {isManager && n.status === 'PENDING' && (
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn onClick={() => handleReviewNote(n.id, 'APPROVED')} variant="success">✓ Aprobar</Btn>
                      <Btn onClick={() => handleReviewNote(n.id, 'REJECTED')} variant="danger">✗ Rechazar</Btn>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop:`1px solid ${T.color.border}`, paddingTop:16 }}>
            <form onSubmit={handleAddNote} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Escribe una nota de avance…"
                rows={2}
                style={{
                  flex:1, padding:'8px 12px', borderRadius:T.radius.sm,
                  border:`1px solid ${T.color.border}`, fontSize:14,
                  color:T.color.textPrimary, background:T.color.surface,
                  resize:'none', boxSizing:'border-box',
                }}
              />
              <Btn type="submit" disabled={submitting || !newNote.trim()}>
                {submitting ? '…' : 'Agregar'}
              </Btn>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}