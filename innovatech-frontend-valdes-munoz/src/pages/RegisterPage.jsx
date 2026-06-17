import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/authService.js'
import { useAuth } from '../context/AuthContext.jsx'

// ── SVG Icons ────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
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

// ── Password Validation ──────────────────────────────────────────────────────
const ALLOWED_SPECIAL = /[.@#$*_?]/
const OBVIOUS_PATTERNS = [
  /^12345678/, /^87654321/, /^abcdefgh/i, /^hgfedcba/i,
  /^qwertyui/i, /^asdfghjk/i, /^zxcvbnm/i,
  /^11111111/, /^00000000/, /^password/i, /^passw0rd/i,
  /(.)\\1{4,}/,
]

function validatePassword(pwd) {
  const errors = []
  if (pwd.length < 8)                              errors.push('Mínimo 8 caracteres')
  if (!/^[A-Z]/.test(pwd))                         errors.push('Debe comenzar con mayúscula')
  if (!ALLOWED_SPECIAL.test(pwd))                  errors.push('Incluir especial: . @ # $ * _ ?')
  if (OBVIOUS_PATTERNS.some(p => p.test(pwd)))     errors.push('Evita patrones obvios')
  return errors
}

function getStrength(pwd) {
  if (!pwd) return { score: 0, level: '', barColor: T.border, width: '0%' }
  let score = 0
  if (pwd.length >= 8)  score += 15
  if (pwd.length >= 10) score += 10
  if (pwd.length >= 14) score += 10
  if (/[A-Z]/.test(pwd))           score += 15
  if (/[a-z]/.test(pwd))           score += 15
  if (/[0-9]/.test(pwd))           score += 15
  if (ALLOWED_SPECIAL.test(pwd))   score += 20
  const types = [/[A-Z]/, /[a-z]/, /[0-9]/, ALLOWED_SPECIAL].filter(r => r.test(pwd)).length
  if (types >= 4) score += 10
  if (OBVIOUS_PATTERNS.some(p => p.test(pwd))) score = Math.max(score - 40, 0)
  score = Math.min(score, 100)
  if (score <= 20) return { score, level: 'Muy débil',  barColor: '#9F2F2D', width: `${score}%` }
  if (score <= 40) return { score, level: 'Débil',      barColor: '#9F2F2D', width: `${score}%` }
  if (score <= 60) return { score, level: 'Normal',     barColor: '#956400', width: `${score}%` }
  if (score <= 80) return { score, level: 'Fuerte',     barColor: '#346538', width: `${score}%` }
  return               { score, level: 'Muy fuerte', barColor: '#346538', width: `${score}%` }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [])

  const strength = getStrength(form.password)
  const pwdErrors = validatePassword(form.password)

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Completa todos los campos.'); return }
    if (pwdErrors.length > 0) { setError(pwdErrors[0]); return }
    setLoading(true)
    try {
      const res = await register(form)
      authLogin({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.status === 400 ? 'El email ya está registrado.' : (err.message ?? 'Error inesperado.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { outline: none !important; border-color: #111111 !important; }
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
          flex: '0 0 38%',
          background: T.text,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100dvh',
        }}>
          <div style={{
            position: 'absolute', bottom: '-10%', left: '-10%',
            width: '320px', height: '320px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div>
            <div style={{
              fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 500,
            }}>
              Nueva cuenta
            </div>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Innovatech<br />Solutions
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                ['Proyectos', 'Crea y gestiona proyectos de software, consultoría e infraestructura.'],
                ['Recursos', 'Asigna equipos y monitorea la disponibilidad en tiempo real.'],
                ['Métricas', 'KPIs y reportes de avance para tomar decisiones informadas.'],
              ].map(([title, desc]) => (
                <div key={title}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.2rem' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
            &copy; {new Date().getFullYear()} Innovatech Solutions
          </div>
        </div>

        {/* ── Right Panel (Form) ──────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: `radial-gradient(ellipse at 20% 80%, rgba(180,160,130,0.04) 0%, transparent 60%), ${T.canvas}`,
          overflowY: 'auto',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            paddingTop: '1rem',
            paddingBottom: '2rem',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '1.6rem', fontWeight: 700, color: T.text,
                letterSpacing: '-0.03em', marginBottom: '0.4rem',
              }}>
                Crea tu cuenta
              </h1>
              <p style={{ fontSize: '0.875rem', color: T.muted }}>
                Accede a todas las herramientas de Innovatech
              </p>
            </div>

            {/* API Error */}
            {error && (
              <div role="alert" style={{
                background: T.errBg, border: `1px solid ${T.errBorder}`,
                borderRadius: '6px', padding: '0.7rem 0.9rem',
                color: T.errText, fontSize: '0.83rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <InputField id="name" name="name" type="text" label="Nombre completo"
                placeholder="Ej: Ana García" value={form.name} onChange={handleChange} />

              {/* Email */}
              <InputField id="email" name="email" type="email" label="Correo electrónico"
                placeholder="correo@empresa.cl" value={form.email} onChange={handleChange} />

              {/* Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="password" style={{
                  display: 'block', fontSize: '0.8rem', fontWeight: 600,
                  color: T.text, marginBottom: '0.4rem',
                }}>
                  Contraseña
                  <span style={{ fontWeight: 400, color: T.muted, fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                    (mín. 8 · mayúscula inicial · especial)
                  </span>
                </label>
                <PasswordInput
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  showPass={showPass}
                  onToggle={() => setShowPass(p => !p)}
                  isInvalid={form.password.length > 0 && pwdErrors.length > 0}
                />

                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{
                      height: '3px', background: T.border, borderRadius: '2px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: strength.barColor,
                        width: strength.width,
                        transition: 'width 0.3s ease, background 0.3s ease',
                      }} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginTop: '0.4rem',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: strength.barColor, fontWeight: 500 }}>
                        {strength.level}
                      </span>
                    </div>
                    {pwdErrors.length > 0 && (
                      <ul style={{
                        margin: '0.4rem 0 0 0', padding: '0',
                        listStyle: 'none',
                      }}>
                        {pwdErrors.map(err => (
                          <li key={err} style={{
                            fontSize: '0.75rem', color: T.muted,
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            marginBottom: '0.2rem',
                          }}>
                            <span style={{ color: T.errText, fontSize: '0.65rem' }}>&#x25CF;</span>
                            {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Role */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="role" style={{
                  display: 'block', fontSize: '0.8rem', fontWeight: 600,
                  color: T.text, marginBottom: '0.4rem',
                }}>
                  Perfil de acceso
                </label>
                <select
                  id="role" name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem',
                    border: `1px solid ${T.border}`, borderRadius: '6px',
                    fontSize: '0.9rem', background: '#FFFFFF', color: T.text,
                    outline: 'none', fontFamily: T.font,
                    cursor: 'pointer', appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23787774' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.85rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#555' : (btnHover ? T.btnHover : T.btnBg),
                  color: T.btnText,
                  border: 'none', borderRadius: '6px',
                  fontSize: '0.9rem', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: T.font, letterSpacing: '-0.01em',
                  transition: 'background 0.18s ease, transform 0.1s ease',
                }}
              >
                {loading ? <SpinnerIcon /> : null}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                {!loading && <ArrowRight />}
              </button>
            </form>

            <div style={{
              marginTop: '2rem', paddingTop: '1.5rem',
              borderTop: `1px solid ${T.border}`, textAlign: 'center',
            }}>
              <span style={{ fontSize: '0.83rem', color: T.muted }}>
                Ya tienes cuenta?{' '}
                <Link to="/login" style={{
                  color: T.text, fontWeight: 600, textDecoration: 'none',
                  borderBottom: '1px solid #EAEAEA', paddingBottom: '1px',
                }}>
                  Inicia sesión
                </Link>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────────
function InputField({ id, name, type, label, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const T = {
    text: '#111111', muted: '#787774', border: '#EAEAEA',
    font: "'Geist Sans','Helvetica Neue',-apple-system,sans-serif",
  }
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: T.text, marginBottom: '0.4rem',
      }}>
        {label}
      </label>
      <input
        id={id} name={name} type={type}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.65rem 0.85rem',
          border: `1px solid ${focused ? '#111111' : T.border}`,
          borderRadius: '6px', fontSize: '0.9rem',
          background: '#FFFFFF', color: T.text, outline: 'none',
          fontFamily: T.font,
          transition: 'border-color 0.18s ease',
        }}
      />
    </div>
  )
}

function PasswordInput({ id, value, onChange, showPass, onToggle, isInvalid }) {
  const [focused, setFocused] = useState(false)
  const border = isInvalid ? 'rgba(159,47,45,0.4)' : (focused ? '#111111' : '#EAEAEA')
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id} name="password"
        type={showPass ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder="Crea tu contraseña segura"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.65rem 2.8rem 0.65rem 0.85rem',
          border: `1px solid ${border}`,
          borderRadius: '6px', fontSize: '0.9rem',
          background: '#FFFFFF', color: '#111111', outline: 'none',
          fontFamily: "'Geist Sans','Helvetica Neue',-apple-system,sans-serif",
          transition: 'border-color 0.18s ease',
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{
          position: 'absolute', right: '0.8rem', top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#787774', padding: 0, display: 'flex', alignItems: 'center',
        }}
      >
        {showPass ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}