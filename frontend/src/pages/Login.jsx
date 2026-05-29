import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, AlertCircle, Phone } from 'lucide-react'
import { setCredentials } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'

const REDIRECTS = {
  admin:    '/dashboard/admin',
  agent:    '/dashboard/agent',
  producer: '/dashboard/producer',
}

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ phone: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [err, setErr]         = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.phone || !form.password) { setErr('Veuillez remplir tous les champs.'); return }
    setLoading(true); setErr(null)
    try {
      const res = await authService.login(form)
      dispatch(setCredentials(res.data))
      navigate(REDIRECTS[res.data.user.role] || '/')
    } catch (e) {
      setErr(e.response?.data?.error || 'Numéro ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--border)', borderRadius: 10,
    fontSize: 14, outline: 'none', background: 'var(--surface)',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box', color: 'var(--ink)',
    transition: 'border-color .15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Panneau gauche — éditorial ──────────────────── */}
      <div
        className="login-panel"
        style={{
          display: 'none', width: '48%',
          background: '#111111', padding: '56px 48px',
          flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Cercle décoratif */}
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', top: -80, right: -80, border: '1px solid rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(249,115,22,0.07)', bottom: -40, left: -40,
        }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#ADADAD', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 28 }}>
            Artisanat Camerounais
          </p>
          <h1 className="display-2" style={{ color: '#FFFFFF', marginBottom: 20 }}>
            Sahel<br /><em style={{ color: 'var(--accent)' }}>Market</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 300, marginBottom: 48 }}>
            L'artisanat du Nord Cameroun, livré partout au pays.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Sacs, bijoux et broderies artisanales' },
              { label: 'Livraison dans toutes les grandes villes' },
              { label: 'Paiement Orange Money & MTN MoMo' },
            ].map(({ label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire ───────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: 'var(--bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo mobile */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
            <span className="serif-lg" style={{ letterSpacing: '-0.02em' }}>Sahel<em>Market</em></span>
          </Link>

          <h2 className="serif-xl" style={{ marginBottom: 6 }}>Connexion</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
              S'inscrire
            </Link>
          </p>

          {err && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20,
              display: 'flex', gap: 10, fontSize: 13, color: '#DC2626', alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Numéro de téléphone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  autoComplete="tel"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} color="var(--ink-3)" /> : <Eye size={16} color="var(--ink-3)" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ marginTop: 8, width: '100%', padding: '14px 0', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--ink-3)' }}>
            En vous connectant, vous acceptez nos{' '}
            <Link to="/legal/terms" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
              Conditions d'utilisation
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .login-panel { display: flex !important; } }
      `}</style>
    </div>
  )
}
