import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/authService.js'
import { useAuth } from '../context/AuthContext.jsx'

// ── SVG Icons ────────────────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  canvas:    '#FBFBFA',
  surface:   '#FFFFFF',
  border:    '#EAEAEA',
  text:      '#111111',
  muted:     '#787774',
  btnBg:     '#111111',
  btnText:   '#FFFFFF',
  btnHover:  '#333333',
  errBg:     '#FDEBEC',
  errText:   '#9F2F2D',
  errBorder: 'rgba(159,47,45,0.2)',
  font:      "'Geist Sans','Helvetica Neue',-apple-system,BlinkMacSystemFont,sans-serif",
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [])

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Completa todos los campos.'); return }
    setLoading(true)
    try {
      const res = await login(form)
      authLogin({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.status === 401 ? 'Email o contraseña incorrectos.' : (err.message ?? 'Error inesperado.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none !important; border-color: #111111 !important; }
        input::placeholder { color: #ADADAA; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        fontFamily: T.font,
        background: T.canvas,
      }}>

        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div style={{
          flex: '0 0 40%',
          background: T.text,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100dvh',
        }}>
          {/* Ambient blob */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-20%',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          {/* Brand */}
          <div>
            <div style={{
              fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 500,
            }}>
              Plataforma de Gestión
            </div>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Innovatech<br />Solutions
            </div>
          </div>

          {/* Middle content */}
          <div>
            <div style={{
              width: '32px', height: '1px', background: 'rgba(255,255,255,0.2)',
              marginBottom: '1.5rem',
            }} />
            <p style={{
              fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7, maxWidth: '240px',
            }}>
              Centraliza la gestión de proyectos, recursos y métricas en un solo lugar.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.03em',
          }}>
            &copy; {new Date().getFullYear()} Innovatech Solutions
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: `radial-gradient(ellipse at 80% 20%, rgba(180,160,130,0.04) 0%, transparent 60%), ${T.canvas}`,
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Heading */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{
                fontSize: '1.6rem', fontWeight: 700, color: T.text,
                letterSpacing: '-0.03em', marginBottom: '0.4rem',
              }}>
                Bienvenido de vuelta
              </h1>
              <p style={{ fontSize: '0.875rem', color: T.muted }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" style={{
                background: T.errBg,
                border: `1px solid ${T.errBorder}`,
                borderRadius: '6px',
                padding: '0.7rem 0.9rem',
                color: T.errText,
                fontSize: '0.83rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup
                id="email" name="email" type="email"
                label="Correo electrónico"
                placeholder="correo@empresa.cl"
                value={form.email}
                onChange={handleChange}
              />
              <FieldGroup
                id="password" name="password" type="password"
                label="Contraseña"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={handleChange}
                style={{ marginBottom: '1.75rem' }}
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#555' : (btnHover ? T.btnHover : T.btnBg),
                  color: T.btnText,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: T.font,
                  letterSpacing: '-0.01em',
                  transition: 'background 0.18s ease, transform 0.1s ease',
                  transform: 'scale(1)',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {loading ? <SpinnerIcon /> : null}
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                {!loading && <ArrowRight />}
              </button>
            </form>

            {/* Divider + Register link */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: `1px solid ${T.border}`,
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '0.83rem', color: T.muted }}>
                Sin cuenta todavía?{' '}
                <Link to="/register" style={{
                  color: T.text, fontWeight: 600, textDecoration: 'none',
                  borderBottom: '1px solid #EAEAEA',
                  paddingBottom: '1px',
                  transition: 'border-color 0.15s',
                }}>
                  Regístrate
                </Link>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ── Field Component ──────────────────────────────────────────────────────────
function FieldGroup({ id, name, type, label, placeholder, value, onChange, style: extraStyle = {} }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '1.1rem', ...extraStyle }}>
      <label htmlFor={id} style={{
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#111111',
        marginBottom: '0.4rem',
        letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '0.65rem 0.85rem',
          border: `1px solid ${focused ? '#111111' : '#EAEAEA'}`,
          borderRadius: '6px',
          fontSize: '0.9rem',
          background: '#FFFFFF',
          color: '#111111',
          outline: 'none',
          fontFamily: "'Geist Sans','Helvetica Neue',-apple-system,sans-serif",
          transition: 'border-color 0.18s ease',
        }}
      />
    </div>
  )
}