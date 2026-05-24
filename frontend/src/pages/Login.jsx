import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { setCredentials } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'

const OR = '#f97316'

const REDIRECTS = {
  admin:    '/dashboard/admin',
  agent:    '/dashboard/agent',
  producer: '/dashboard/producer',
}

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [err, setErr]       = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { setErr('Veuillez remplir tous les champs.'); return }
    setLoading(true); setErr(null)
    try {
      const res = await authService.login(form)
      dispatch(setCredentials(res.data))
      navigate(REDIRECTS[res.data.user.role] || '/')
    } catch (e) {
      setErr(e.response?.data?.error || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '12px 14px', border: `1px solid ${hasErr ? '#fca5a5' : '#d1d5db'}`,
    borderRadius: 12, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111827',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Panneau gauche — marque */}
      <div style={{
        display: 'none',
        width: '50%', background: '#1a1a1a', padding: '48px',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}
        className="login-panel"
      >
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: OR, opacity: 0.06, top: -100, right: -100,
        }} />
        <div style={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          background: OR, opacity: 0.08, bottom: -50, left: -50,
        }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: OR,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 32, fontWeight: 900, color: '#fff',
          }}>
            S
          </div>
          <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Sahel<br />
            <span style={{ color: OR }}>Market</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>
            L'artisanat du Nord Cameroun, livré partout au pays.
          </p>
        </div>

        <div style={{ position: 'relative', marginTop: 64, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300, width: '100%' }}>
          {[
            { emoji: '🧺', text: 'Paniers, bijoux, broderies artisanales' },
            { emoji: '📦', text: 'Livraison dans toutes les grandes villes' },
            { emoji: '💳', text: 'Paiement Orange Money & MTN MoMo' },
          ].map(({ emoji, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: OR,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: 18,
            }}>S</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#111827' }}>Sahel Market</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Connexion
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>

          {err && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
              padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10,
              fontSize: 13, color: '#dc2626', alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
                style={inputStyle(false)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inputStyle(false), paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {showPwd
                    ? <EyeOff size={16} color="#9ca3af" />
                    : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8, width: '100%', padding: '14px 0', borderRadius: 12,
                border: 'none', background: loading ? '#fdba74' : OR,
                color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#9ca3af' }}>
            En vous connectant, vous acceptez nos{' '}
            <Link to="/legal/terms" style={{ color: OR, textDecoration: 'none' }}>
              Conditions d'utilisation
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .login-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
