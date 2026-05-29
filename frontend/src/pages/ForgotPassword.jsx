import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../services/api.js'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState(null)
  const [sent, setSent]       = useState(false)

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--border)', borderRadius: 10,
    fontSize: 14, outline: 'none', background: 'var(--surface)',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box', color: 'var(--ink)',
    transition: 'border-color .15s',
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim()) { setErr('Veuillez entrer votre adresse email.'); return }
    setLoading(true); setErr(null)
    try {
      await api.post('/auth/password-reset/', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (e) {
      setErr(e.response?.data?.error || 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 32 }}>
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>

        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          <span className="serif-lg" style={{ letterSpacing: '-0.02em' }}>Sahel<em>Market</em></span>
        </Link>

        <h2 className="serif-xl" style={{ marginBottom: 8 }}>Mot de passe oublié</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28, lineHeight: 1.6 }}>
          Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {sent ? (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12,
            padding: '20px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <CheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Email envoyé !</p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                Si <strong>{email}</strong> est associé à un compte, vous recevrez un email avec le lien de réinitialisation dans quelques minutes.
              </p>
              <p style={{ fontSize: 12, color: '#4ade80', marginTop: 10 }}>
                Pensez à vérifier vos spams.
              </p>
            </div>
          </div>
        ) : (
          <>
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
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Adresse email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    style={{ ...inputStyle, paddingLeft: 38 }}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent"
                style={{ marginTop: 8, width: '100%', padding: '14px 0', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--ink-3)' }}>
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
