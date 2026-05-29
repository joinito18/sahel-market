import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react'
import api from '../services/api.js'

export default function ResetPassword() {
  const { uid, token }            = useParams()
  const navigate                  = useNavigate()
  const [form, setForm]           = useState({ new_password: '', new_password2: '' })
  const [showPwd, setShowPwd]     = useState(false)
  const [showPwd2, setShowPwd2]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [err, setErr]             = useState(null)
  const [success, setSuccess]     = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--border)', borderRadius: 10,
    fontSize: 14, outline: 'none', background: 'var(--surface)',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box', color: 'var(--ink)',
    transition: 'border-color .15s',
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.new_password || !form.new_password2) { setErr('Veuillez remplir tous les champs.'); return }
    if (form.new_password !== form.new_password2)  { setErr('Les mots de passe ne correspondent pas.'); return }
    if (form.new_password.length < 8)              { setErr('Le mot de passe doit contenir au moins 8 caractères.'); return }

    setLoading(true); setErr(null)
    try {
      await api.post('/auth/password-reset/confirm/', {
        uid,
        token,
        new_password:  form.new_password,
        new_password2: form.new_password2,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      setErr(e.response?.data?.error || 'Lien invalide ou expiré. Refaites une demande.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16,
            padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <CheckCircle size={40} style={{ color: '#16a34a' }} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Mot de passe modifié !</p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                Votre mot de passe a été réinitialisé avec succès.<br />
                Vous allez être redirigé vers la connexion…
              </p>
            </div>
            <Link to="/login" className="btn-accent" style={{ padding: '12px 32px', textDecoration: 'none' }}>
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
          <span className="serif-lg" style={{ letterSpacing: '-0.02em' }}>Sahel<em>Market</em></span>
        </Link>

        <h2 className="serif-xl" style={{ marginBottom: 8 }}>Nouveau mot de passe</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28, lineHeight: 1.6 }}>
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {err && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20,
            display: 'flex', gap: 10, fontSize: 13, color: '#DC2626', alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{err}{' '}
              {err.includes('expiré') && (
                <Link to="/forgot-password" style={{ color: '#DC2626', fontWeight: 700, textDecoration: 'underline' }}>
                  Refaire une demande
                </Link>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Nouveau mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.new_password}
                onChange={e => set('new_password', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingLeft: 38, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPwd ? <EyeOff size={16} color="var(--ink-3)" /> : <Eye size={16} color="var(--ink-3)" />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Confirmer le mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
              <input
                type={showPwd2 ? 'text' : 'password'}
                value={form.new_password2}
                onChange={e => set('new_password2', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingLeft: 38, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPwd2(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPwd2 ? <EyeOff size={16} color="var(--ink-3)" /> : <Eye size={16} color="var(--ink-3)" />}
              </button>
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: -4 }}>Minimum 8 caractères.</p>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{ marginTop: 8, width: '100%', padding: '14px 0', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
