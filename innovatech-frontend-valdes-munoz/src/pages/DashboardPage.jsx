import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getProjects, createProject, updateProject, deleteProject,
  assignEmployee, unassignEmployee,
  getNotes, addNote, reviewNote,
} from '../services/projectService.js'
import { getEmployees } from '../services/authService.js'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  canvas:  '#FBFBFA',
  surface: '#FFFFFF',
  border:  '#EAEAEA',
  text:    '#111111',
  muted:   '#787774',
  subtle:  '#ADADAA',
  btnBg:   '#111111',
  btnText: '#FFFFFF',
  font:    "'Geist Sans','Helvetica Neue',-apple-system,BlinkMacSystemFont,sans-serif",
}

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PLANNING:    { bg: '#E1F3FE', color: '#1F6C9F', label: 'Planificación' },
  IN_PROGRESS: { bg: '#EDF3EC', color: '#346538', label: 'En Progreso'   },
  COMPLETED:   { bg: '#FBF3DB', color: '#956400', label: 'Completado'    },
  ON_HOLD:     { bg: '#FDEBEC', color: '#9F2F2D', label: 'En Espera'     },
  CANCELLED:   { bg: '#F3F3F2', color: '#787774', label: 'Cancelado'     },
}

// ── Note Config ───────────────────────────────────────────────────────────────
const NOTE_CFG = {
  PENDING:  { bg: '#FBF3DB', color: '#956400', label: 'Pendiente', icon: '⏳' },
  APPROVED: { bg: '#EDF3EC', color: '#346538', label: 'Aprobada',  icon: '✅' },
  REJECTED: { bg: '#FDEBEC', color: '#9F2F2D', label: 'Rechazada', icon: '❌' },
}

const DEFAULT_PROJ = { name: '', description: '', type: 'SOFTWARE', status: 'PLANNING' }

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const icons = {
  logout: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  user: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  userX: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
    </svg>
  ),
  notes: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  folder: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DDDDD9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  close: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  spinner: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = user?.role ?? 'EMPLOYEE'
  const isAdmin    = role === 'ADMIN'
  const isAdminOrMgr = role === 'ADMIN' || role === 'MANAGER'

  // State
  const [projects,  setProjects]  = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [mounted,   setMounted]   = useState(false)
  const [error,     setError]     = useState(null)

  // Modal: 'create' | 'edit' | 'assign' | 'notes' | null
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)

  // Forms
  const [projForm,  setProjForm]  = useState(DEFAULT_PROJ)
  const [assignEmp, setAssignEmp] = useState('')
  const [noteText,  setNoteText]  = useState('')
  const [notes,     setNotes]     = useState([])
  const [saving,    setSaving]    = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoading(true)
    try { setProjects(await getProjects() ?? []) }
    catch { setProjects([]) }
    finally { setLoading(false) }
  }, [])

  const loadEmployees = useCallback(async () => {
    if (!isAdminOrMgr) return
    try { setEmployees(await getEmployees()) } catch { setEmployees([]) }
  }, [isAdminOrMgr])

  useEffect(() => {
    loadProjects()
    loadEmployees()
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [loadProjects, loadEmployees])

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openModal(type, project = null) {
    setSelected(project)
    setError(null)
    if (type === 'create') setProjForm(DEFAULT_PROJ)
    if (type === 'edit' && project)
      setProjForm({ name: project.name, description: project.description ?? '', type: project.type, status: project.status })
    if (type === 'assign' && project)
      setAssignEmp(project.assignedUserId ? String(project.assignedUserId) : '')
    if (type === 'notes' && project) {
      setNoteText('')
      getNotes(project.id).then(setNotes).catch(() => setNotes([]))
    }
    setModal(type)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login') }

  async function handleCreate() {
    if (!projForm.name.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true); setError(null)
    try {
      const created = await createProject(projForm)
      setProjects(p => [created, ...p])
      setModal(null)
    } catch (e) { setError(e?.message ?? 'Error al crear proyecto') }
    finally { setSaving(false) }
  }

  async function handleEdit() {
    setSaving(true); setError(null)
    try {
      const updated = await updateProject(selected.id, projForm)
      setProjects(p => p.map(x => x.id === selected.id ? updated : x))
      setModal(null)
    } catch (e) { setError(e?.message ?? 'Error al editar') }
    finally { setSaving(false) }
  }

  async function handleDelete(project) {
    if (!window.confirm(`¿Eliminar "${project.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteProject(project.id)
      setProjects(p => p.filter(x => x.id !== project.id))
    } catch { alert('Error al eliminar el proyecto') }
  }

  async function handleAssign() {
    if (!assignEmp) { setError('Selecciona un empleado'); return }
    setSaving(true); setError(null)
    const emp = employees.find(e => String(e.id) === assignEmp)
    try {
      const updated = await assignEmployee(selected.id, emp.id, emp.name)
      setProjects(p => p.map(x => x.id === selected.id ? updated : x))
      setModal(null)
    } catch (e) { setError(e?.message ?? 'Error al asignar') }
    finally { setSaving(false) }
  }

  async function handleUnassign(project) {
    if (!window.confirm('¿Desasignar al empleado de este proyecto?')) return
    try {
      const updated = await unassignEmployee(project.id)
      setProjects(p => p.map(x => x.id === project.id ? updated : x))
    } catch { alert('Error al desasignar empleado') }
  }

  async function handleAddNote() {
    if (!noteText.trim()) { setError('Escribe el contenido de la nota'); return }
    setSaving(true); setError(null)
    try {
      const note = await addNote(selected.id, noteText)
      setNotes(n => [...n, note])
      setNoteText('')
    } catch (e) { setError(e?.message ?? 'Error al agregar nota') }
    finally { setSaving(false) }
  }

  async function handleReview(noteId, status) {
    const comment = status === 'REJECTED'
      ? prompt('Comentario de rechazo (opcional):') ?? ''
      : ''
    try {
      const updated = await reviewNote(selected.id, noteId, { status, reviewComment: comment })
      setNotes(n => n.map(x => x.id === noteId ? updated : x))
    } catch { alert('Error al revisar la nota') }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total',          value: projects.length,                                        accent: T.text },
    { label: 'En progreso',    value: projects.filter(p => p.status === 'IN_PROGRESS').length, accent: '#346538' },
    { label: 'Completados',    value: projects.filter(p => p.status === 'COMPLETED').length,   accent: '#956400' },
    { label: 'Planificación',  value: projects.filter(p => p.status === 'PLANNING').length,    accent: '#1F6C9F' },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.canvas}; }
        input:focus, select:focus, textarea:focus { outline: none !important; border-color: ${T.text} !important; }
        input::placeholder, textarea::placeholder { color: #C0BFBD; }
        tbody tr { transition: background 0.1s; }
        tbody tr:hover { background: #FAFAF9; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 9999px; }
      `}</style>

      <div style={{ minHeight: '100dvh', background: T.canvas, fontFamily: T.font }}>

        {/* ── Navbar ───────────────────────────────────────────────── */}
        <nav style={{
          background: T.surface, borderBottom: `1px solid ${T.border}`,
          height: 52, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 2rem',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
              Innovatech
            </span>
            <span style={{
              fontSize: '0.68rem', letterSpacing: '0.08em', color: T.muted,
              textTransform: 'uppercase', fontWeight: 500,
              paddingLeft: '0.75rem', borderLeft: `1px solid ${T.border}`,
            }}>
              Gestión de Proyectos
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: T.muted }}>{user?.name}</span>
              {user?.role && (
                <span style={{
                  fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontWeight: 600, color: '#1F6C9F', background: '#E1F3FE',
                  padding: '2px 8px', borderRadius: 9999,
                }}>
                  {user.role}
                </span>
              )}
            </div>
            <Btn
              variant="ghost"
              icon={icons.logout}
              onClick={handleLogout}
            >
              Salir
            </Btn>
          </div>
        </nav>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main style={{
          maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Page header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: T.text, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
              {role === 'EMPLOYEE' ? 'Mis proyectos' : 'Panel de proyectos'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: T.muted }}>
              {role === 'EMPLOYEE'
                ? 'Tus proyectos asignados y notas de avance.'
                : 'Gestiona, asigna y monitorea el avance de todos los proyectos.'}
            </p>
          </div>

          {/* Stats bento — solo admin/manager */}
          {isAdminOrMgr && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px', background: T.border,
              borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${T.border}`, marginBottom: '2rem',
            }}>
              {stats.map(({ label, value, accent }, i) => (
                <div key={label} style={{ background: T.surface, padding: '1.5rem 1.25rem' }}>
                  <div style={{
                    fontSize: '2rem', fontWeight: 700, color: accent,
                    letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.3rem',
                  }}>
                    {loading
                      ? <div style={{ width: 40, height: 26, background: '#F0EFED', borderRadius: 4 }} />
                      : value}
                  </div>
                  <div style={{ fontSize: '0.77rem', color: T.muted, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Projects card */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>

            {/* Section header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}`,
            }}>
              <div>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>
                  {role === 'EMPLOYEE' ? 'Proyectos asignados' : 'Proyectos'}
                </h2>
                {!loading && (
                  <p style={{ fontSize: '0.77rem', color: T.muted, marginTop: '0.1rem' }}>
                    {projects.length} {projects.length === 1 ? 'proyecto registrado' : 'proyectos registrados'}
                  </p>
                )}
              </div>
              {isAdmin && (
                <Btn variant="primary" icon={icons.plus} onClick={() => openModal('create')}>
                  Nuevo proyecto
                </Btn>
              )}
            </div>

            {/* Table / states */}
            {loading ? (
              <SkeletonTable />
            ) : projects.length === 0 ? (
              <EmptyState
                isEmployee={role === 'EMPLOYEE'}
                onAction={isAdmin ? () => openModal('create') : null}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {['Nombre', 'Descripción', 'Tipo', 'Estado', 'Asignado a', 'Acciones'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '0.7rem 1.25rem',
                          fontSize: '0.69rem', fontWeight: 600, color: T.muted,
                          letterSpacing: '0.07em', textTransform: 'uppercase',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <ProjectRow
                        key={p.id ?? i}
                        project={p}
                        role={role}
                        isAdmin={isAdmin}
                        isAdminOrMgr={isAdminOrMgr}
                        onEdit={() => openModal('edit', p)}
                        onDelete={() => handleDelete(p)}
                        onAssign={() => openModal('assign', p)}
                        onUnassign={() => handleUnassign(p)}
                        onNotes={() => openModal('notes', p)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MODAL: CREATE ────────────────────────────────────────────── */}
      {modal === 'create' && (
        <Modal title="Nuevo proyecto" subtitle="Completa la información para crear el proyecto" onClose={() => setModal(null)}>
          {error && <ErrorBox>{error}</ErrorBox>}
          <MField label="Nombre *" id="m-name" placeholder="Ej: Portal de Clientes 2025"
            value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} />
          <MField label="Descripción" id="m-desc" placeholder="Breve descripción del alcance"
            value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <MLabel>Tipo</MLabel>
              <MSelect value={projForm.type} onChange={e => setProjForm(p => ({ ...p, type: e.target.value }))}>
                {['SOFTWARE', 'CONSULTING', 'INFRASTRUCTURE'].map(t => <option key={t} value={t}>{t}</option>)}
              </MSelect>
            </div>
            <div>
              <MLabel>Estado inicial</MLabel>
              <MSelect value={projForm.status} onChange={e => setProjForm(p => ({ ...p, status: e.target.value }))}>
                {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </MSelect>
            </div>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleCreate}
            saving={saving}
            disabled={!projForm.name.trim()}
            confirmLabel="Crear proyecto"
          />
        </Modal>
      )}

      {/* ── MODAL: EDIT ──────────────────────────────────────────────── */}
      {modal === 'edit' && (
        <Modal title="Editar proyecto" subtitle={`Modificando: ${selected?.name}`} onClose={() => setModal(null)}>
          {error && <ErrorBox>{error}</ErrorBox>}
          <MField label="Nombre" id="e-name" placeholder="Nombre del proyecto"
            value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} />
          <MTextarea label="Descripción" id="e-desc" placeholder="Descripción del proyecto"
            value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} />
          <div style={{ marginBottom: '1.5rem' }}>
            <MLabel>Estado</MLabel>
            <MSelect value={projForm.status} onChange={e => setProjForm(p => ({ ...p, status: e.target.value }))}>
              {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </MSelect>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleEdit}
            saving={saving}
            confirmLabel="Guardar cambios"
          />
        </Modal>
      )}

      {/* ── MODAL: ASSIGN ────────────────────────────────────────────── */}
      {modal === 'assign' && (
        <Modal title="Asignar empleado" subtitle={`Proyecto: ${selected?.name}`} onClose={() => setModal(null)}>
          {error && <ErrorBox>{error}</ErrorBox>}
          {employees.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: T.muted, marginBottom: '1.5rem' }}>
              No hay empleados con rol EMPLOYEE registrados.
            </p>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <MLabel>Seleccionar empleado</MLabel>
              <MSelect value={assignEmp} onChange={e => setAssignEmp(e.target.value)}>
                <option value="">-- Selecciona un empleado --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                ))}
              </MSelect>
            </div>
          )}
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleAssign}
            saving={saving}
            disabled={employees.length === 0 || !assignEmp}
            confirmLabel="Asignar empleado"
          />
        </Modal>
      )}

      {/* ── MODAL: NOTES ─────────────────────────────────────────────── */}
      {modal === 'notes' && (
        <Modal
          title={`Notas — ${selected?.name}`}
          subtitle={`${notes.length} nota${notes.length !== 1 ? 's' : ''} de avance`}
          onClose={() => setModal(null)}
          wide
        >
          <div style={{
            background: '#F7F7F6', borderRadius: 6, padding: '0.65rem 0.85rem',
            marginBottom: '1rem', fontSize: '0.78rem', color: T.muted,
            border: `1px solid ${T.border}`,
          }}>
            El empleado agrega notas de avance. Admin y Manager las revisan y aprueban ✅ o rechazan ❌ — igual que un Pull Request.
          </div>

          {error && <ErrorBox>{error}</ErrorBox>}

          {/* Note list */}
          <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: T.subtle, fontSize: '0.875rem' }}>
                No hay notas aún. Sé el primero en agregar una.
              </div>
            ) : notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                canReview={isAdminOrMgr}
                onReview={handleReview}
              />
            ))}
          </div>

          {/* Add note */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '1rem' }}>
            <MLabel>Agregar nota de avance</MLabel>
            <textarea
              rows={3}
              placeholder="Describe el avance realizado en este proyecto..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.8rem', marginBottom: '0.9rem',
                border: `1px solid ${T.border}`, borderRadius: 6,
                fontSize: '0.875rem', fontFamily: T.font, resize: 'vertical',
                color: T.text, background: T.surface, minHeight: 80,
              }}
            />
            <ModalActions
              onCancel={() => setModal(null)}
              cancelLabel="Cerrar"
              onConfirm={handleAddNote}
              saving={saving}
              disabled={!noteText.trim()}
              confirmLabel="Enviar nota"
            />
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Project Row ───────────────────────────────────────────────────────────────
function ProjectRow({ project: p, role, isAdmin, isAdminOrMgr, onEdit, onDelete, onAssign, onUnassign, onNotes }) {
  const cfg = STATUS_CFG[p.status] ?? { bg: '#F3F3F2', color: '#787774', label: p.status }

  return (
    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
      <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.875rem', color: T.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {p.name}
      </td>
      <td style={{ padding: '0.9rem 1.25rem', maxWidth: 220 }}>
        <span style={{
          display: 'block', overflow: 'hidden', whiteSpace: 'nowrap',
          textOverflow: 'ellipsis', fontSize: '0.845rem', color: T.muted,
        }}>
          {p.description || <span style={{ color: '#C0BFBD', fontStyle: 'italic' }}>Sin descripción</span>}
        </span>
      </td>
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <span style={{ fontSize: '0.69rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, color: T.subtle }}>
          {p.type}
        </span>
      </td>
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <span style={{
          display: 'inline-block', background: cfg.bg, color: cfg.color,
          padding: '3px 10px', borderRadius: 9999,
          fontSize: '0.69rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </span>
      </td>
      <td style={{ padding: '0.9rem 1.25rem' }}>
        {p.assignedUserName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#E1F3FE', color: '#1F6C9F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            }}>
              {p.assignedUserName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.845rem', color: T.text }}>{p.assignedUserName}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#C0BFBD', fontStyle: 'italic' }}>Sin asignar</span>
        )}
      </td>
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {/* Notas — todos */}
          <IconBtn onClick={onNotes} title="Ver notas" hoverBg="#E1F3FE" hoverColor="#1F6C9F">
            {icons.notes}
          </IconBtn>
          {/* Asignar / Desasignar — admin + manager */}
          {isAdminOrMgr && (
            <IconBtn onClick={onAssign} title="Asignar empleado" hoverBg="#EDF3EC" hoverColor="#346538">
              {icons.user}
            </IconBtn>
          )}
          {isAdminOrMgr && p.assignedUserId && (
            <IconBtn onClick={onUnassign} title="Desasignar empleado" hoverBg="#FBF3DB" hoverColor="#956400">
              {icons.userX}
            </IconBtn>
          )}
          {/* Editar / Eliminar — solo admin */}
          {isAdmin && (
            <IconBtn onClick={onEdit} title="Editar proyecto" hoverBg="#F3F3F2" hoverColor="#111111">
              {icons.edit}
            </IconBtn>
          )}
          {isAdmin && (
            <IconBtn onClick={onDelete} title="Eliminar proyecto" hoverBg="#FDEBEC" hoverColor="#9F2F2D">
              {icons.trash}
            </IconBtn>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, canReview, onReview }) {
  const meta = NOTE_CFG[note.status] ?? NOTE_CFG.PENDING
  const date = note.createdAt
    ? new Date(note.createdAt).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
    : ''

  return (
    <div style={{
      border: `1px solid ${T.border}`, borderLeft: `3px solid ${meta.color}`,
      borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '0.6rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
        <div>
          <strong style={{ fontSize: '0.845rem', color: T.text }}>
            {note.authorName || `Usuario #${note.authorId}`}
          </strong>
          {date && <span style={{ fontSize: '0.75rem', color: T.subtle, marginLeft: '0.4rem' }}>· {date}</span>}
        </div>
        <span style={{
          background: meta.bg, color: meta.color, padding: '2px 8px',
          borderRadius: 9999, fontSize: '0.69rem', fontWeight: 600,
          letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: T.text, lineHeight: 1.55, marginBottom: '0.4rem' }}>
        {note.content}
      </p>

      {note.status !== 'PENDING' && note.reviewComment && (
        <div style={{
          background: '#F7F7F6', borderRadius: 6, padding: '0.6rem 0.75rem',
          marginTop: '0.4rem', fontSize: '0.8rem',
        }}>
          <strong style={{ color: meta.color }}>{meta.icon} {note.reviewerName}:</strong>
          <span style={{ color: T.muted, marginLeft: '0.35rem' }}>{note.reviewComment}</span>
        </div>
      )}

      {canReview && note.status === 'PENDING' && (
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
          <button
            onClick={() => onReview(note.id, 'APPROVED')}
            style={{
              background: '#EDF3EC', color: '#346538', border: '1px solid #B7D9B8',
              padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
            }}
          >
            ✅ Aprobar
          </button>
          <button
            onClick={() => onReview(note.id, 'REJECTED')}
            style={{
              background: '#FDEBEC', color: '#9F2F2D', border: '1px solid #F5C2C2',
              padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
            }}
          >
            ❌ Rechazar
          </button>
        </div>
      )}
    </div>
  )
}

// ── Reusable UI ───────────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem', backdropFilter: 'blur(2px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: T.surface, borderRadius: 12,
        width: '100%', maxWidth: wide ? 620 : 460,
        border: `1px solid ${T.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.4rem 1.5rem 1.2rem',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: T.text, letterSpacing: '-0.01em', marginBottom: '0.15rem' }}>
              {title}
            </h3>
            {subtitle && <p style={{ fontSize: '0.77rem', color: T.muted }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '4px', display: 'flex', borderRadius: 4 }}
          >
            {icons.close}
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '1.4rem 1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onConfirm, saving, disabled = false, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
  const [hover, setHover] = useState(false)
  const isDisabled = saving || disabled
  return (
    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
      <button
        onClick={onCancel}
        style={{
          background: 'transparent', border: `1px solid ${T.border}`,
          color: T.muted, padding: '0.52rem 1.1rem', borderRadius: 6,
          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, fontFamily: T.font,
        }}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onConfirm}
        disabled={isDisabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: isDisabled ? '#ADADAA' : hover ? '#333' : T.btnBg,
          color: T.btnText, border: 'none', borderRadius: 6,
          padding: '0.52rem 1.2rem', fontSize: '0.85rem', fontWeight: 600,
          cursor: isDisabled ? 'not-allowed' : 'pointer', fontFamily: T.font,
          transition: 'background 0.15s',
        }}
      >
        {saving && icons.spinner}
        {saving ? 'Guardando...' : confirmLabel}
      </button>
    </div>
  )
}

function Btn({ children, onClick, variant = 'ghost', icon }) {
  const [h, setH] = useState(false)
  const isPrimary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: isPrimary ? (h ? '#333' : T.btnBg) : 'none',
        color: isPrimary ? T.btnText : h ? T.text : T.muted,
        border: isPrimary ? 'none' : `1px solid ${h ? '#ADADAA' : T.border}`,
        padding: isPrimary ? '0.48rem 1rem' : '5px 12px',
        borderRadius: 6, cursor: 'pointer',
        fontSize: isPrimary ? '0.82rem' : '0.78rem',
        fontWeight: isPrimary ? 600 : 500,
        fontFamily: T.font, transition: 'all 0.15s',
      }}
    >
      {icon}{children}
    </button>
  )
}

function IconBtn({ children, onClick, title, hoverBg, hoverColor }) {
  const [h, setH] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? hoverBg : 'transparent',
        color: h ? hoverColor : T.muted,
        border: 'none', borderRadius: 5, cursor: 'pointer',
        padding: '5px 7px', display: 'flex', alignItems: 'center',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function MField({ id, label, placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <MLabel htmlFor={id}>{label}</MLabel>
      <input
        id={id} type="text" placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', padding: '0.58rem 0.8rem',
          border: `1px solid ${f ? T.text : T.border}`, borderRadius: 6,
          fontSize: '0.875rem', fontFamily: T.font, color: T.text,
          background: T.surface, transition: 'border-color 0.18s',
        }}
      />
    </div>
  )
}

function MTextarea({ id, label, placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <MLabel htmlFor={id}>{label}</MLabel>
      <textarea
        id={id} placeholder={placeholder} value={value} onChange={onChange} rows={3}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', padding: '0.58rem 0.8rem',
          border: `1px solid ${f ? T.text : T.border}`, borderRadius: 6,
          fontSize: '0.875rem', fontFamily: T.font, color: T.text,
          background: T.surface, resize: 'vertical', minHeight: 76,
          transition: 'border-color 0.18s',
        }}
      />
    </div>
  )
}

function MSelect({ value, onChange, children }) {
  const [f, setF] = useState(false)
  return (
    <select
      value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width: '100%', padding: '0.58rem 2.2rem 0.58rem 0.8rem',
        border: `1px solid ${f ? T.text : T.border}`, borderRadius: 6,
        fontSize: '0.875rem', fontFamily: T.font, color: T.text,
        background: T.surface, cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23787774' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center',
        transition: 'border-color 0.18s',
      }}
    >
      {children}
    </select>
  )
}

function MLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{
      display: 'block', fontSize: '0.78rem', fontWeight: 600,
      color: T.text, marginBottom: '0.35rem',
    }}>
      {children}
    </label>
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{
      background: '#FDEBEC', border: '1px solid #F5C2C2',
      borderRadius: 6, padding: '0.55rem 0.8rem',
      color: '#9F2F2D', fontSize: '0.845rem', marginBottom: '0.9rem',
    }}>
      {children}
    </div>
  )
}

function EmptyState({ isEmployee, onAction }) {
  return (
    <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
      {icons.folder}
      <p style={{ fontSize: '0.9rem', color: '#ADADAA', fontWeight: 500, marginTop: '0.25rem' }}>
        {isEmployee ? 'No tienes proyectos asignados' : 'No hay proyectos registrados aún'}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#C0BFBD' }}>
        {isEmployee ? 'Espera a que te asignen uno.' : 'Crea el primero para empezar.'}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: T.btnBg, color: T.btnText, border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: T.font,
          }}
        >
          {icons.plus} Crear proyecto
        </button>
      )}
    </div>
  )
}

function SkeletonTable() {
  return (
    <div style={{ padding: '1rem 1.5rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: '1rem', padding: '0.9rem 0',
          borderBottom: i < 3 ? `1px solid ${T.border}` : 'none',
        }}>
          <div style={{ flex: 2, height: 13, background: '#F0EFED', borderRadius: 4 }} />
          <div style={{ flex: 3, height: 13, background: '#F5F5F4', borderRadius: 4 }} />
          <div style={{ flex: 1, height: 13, background: '#F5F5F4', borderRadius: 4 }} />
          <div style={{ flex: 1.5, height: 21, background: '#F0EFED', borderRadius: 9999, maxWidth: 100 }} />
          <div style={{ flex: 2, height: 13, background: '#F5F5F4', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}