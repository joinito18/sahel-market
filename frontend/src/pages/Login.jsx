import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, AlertCircle, Phone, Lock } from 'lucide-react'
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Panneau gauche (desktop) ─────────────────── */}
      <div className="login-panel" style={{
        display: 'none', width: '46%',
        background: '#111111', padding: '64px 56px',
        flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.025)', top: -100, right: -100, border: '1px solid rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'rgba(249,115,22,0.06)', bottom: -60, left: -60 }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b6b6b', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 40 }}>
            Artisanat Camerounais
          </p>
          <h1 className="display-2" style={{ color: '#fff', marginBottom: 24 }}>
            Sahel<br /><em style={{ color: 'var(--accent)' }}>Market</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.8, maxWidth: 320, marginBottom: 56 }}>
            La marketplace artisanale du Nord Cameroun. Livraison partout au pays.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              'Sacs, bijoux et broderies artisanales',
              'Livraison dans toutes les grandes villes',
              'Paiement Orange Money & MTN MoMo',
            ].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ───────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 32px', background: 'var(--bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 52 }}>
            <span className="serif-lg" style={{ letterSpacing: '-0.02em' }}>Sahel<em>Market</em></span>
          </Link>

          {/* Titre */}
          <h2 className="serif-xl" style={{ marginBottom: 10 }}>Connexion</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 40, lineHeight: 1.6 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
              S'inscrire gratuitement
            </Link>
          </p>

          {/* Erreur */}
          {err && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
              padding: '14px 18px', marginBottom: 28,
              display: 'flex', gap: 10, fontSize: 13, color: '#DC2626', alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              {err}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Téléphone */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Numéro de téléphone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  autoComplete="tel"
                  style={{
                    width: '100%', padding: '14px 14px 14px 40px',
                    border: '1.5px solid var(--border)', borderRadius: 12,
                    fontSize: 14, outline: 'none', background: 'var(--surface)',
                    fontFamily: 'var(--font-sans)', boxSizing: 'border-box', color: 'var(--ink)',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '14px 44px 14px 40px',
                    border: '1.5px solid var(--border)', borderRadius: 12,
                    fontSize: 14, outline: 'none', background: 'var(--surface)',
                    fontFamily: 'var(--font-sans)', boxSizing: 'border-box', color: 'var(--ink)',
                    transition: 'border-color .15s',
                  }}
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

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ width: '100%', padding: '16px 0', marginTop: 4, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15 }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {/* Footer légal */}
          <p style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7 }}>
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
