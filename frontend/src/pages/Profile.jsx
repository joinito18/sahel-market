import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Check, AlertCircle, LogOut, ShoppingBag, User, Star, Gift, Copy, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import { updateUser, logout } from '../store/authSlice.js'
import toast from 'react-hot-toast'

const OR = '#2D6A4F'
const BG = '#f0f2f5'

const ROLE_LABELS = {
  client:   'Client',
  producer: 'Artisan',
  agent:    'Agent',
  admin:    'Administrateur',
}

const DASHBOARD_LINKS = {
  producer: { to: '/dashboard/producer', label: 'Tableau de bord artisan' },
  agent:    { to: '/dashboard/agent',    label: 'Tableau de bord agent' },
  admin:    { to: '/dashboard/admin',    label: 'Administration' },
}

export default function Profile() {
  const { user } = useSelector(s => s.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const fileRef   = useRef()

  const [form, setForm] = useState({
    username: '', email: '', phone: '', whatsapp: '', address: '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [err, setErr]         = useState(null)
  const [referral, setReferral] = useState(null)

  useEffect(() => {
    authService.getReferral().then(r => setReferral(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) setForm({
      username: user.username  || '',
      email:    user.email     || '',
      phone:    user.phone     || '',
      whatsapp: user.whatsapp  || '',
      address:  user.address   || '',
    })
  }, [user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null); setSaved(false)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      const res = await authService.updateMe(fd)
      dispatch(updateUser(res.data))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setErr('Erreur lors de la mise à jour du profil.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = e => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    authService.updateMe(fd).then(res => dispatch(updateUser(res.data)))
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111827',
  }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  const dashLink = DASHBOARD_LINKS[user?.role]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ background: 'var(--ink)', padding: '24px 0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Mon compte
          </p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Mon profil
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar + identité */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
          padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
              background: '#eff8f3', border: `3px solid ${OR}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 28, fontWeight: 900, color: OR }}>
                    {(user?.username || '?')[0].toUpperCase()}
                  </span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: OR, border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={13} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20, background: '#eff8f3', color: OR,
            }}>
              {ROLE_LABELS[user?.role] || 'Membre'}
            </span>
          </div>
        </div>

        {/* Lien dashboard selon rôle */}
        {dashLink && (
          <Link to={dashLink.to} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
            padding: '14px 20px', textDecoration: 'none', color: '#111827',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <User size={16} color={OR} />
              <p style={{ fontSize: 13, fontWeight: 600 }}>{dashLink.label}</p>
            </div>
            <span style={{ color: OR, fontSize: 18 }}>→</span>
          </Link>
        )}

        {/* Carte de fidélité */}
        {user?.loyalty_points !== undefined && (() => {
          const pts   = user.loyalty_points
          const value = Math.floor(pts / 100) * 500
          const TIERS = [
            { name: 'Bronze', min: 0,    max: 499,  icon: '🥉', color: '#cd7f32', next: 500  },
            { name: 'Argent', min: 500,  max: 1499, icon: '🥈', color: '#aaaaaa', next: 1500 },
            { name: 'Or',     min: 1500, max: Infinity, icon: '🥇', color: '#f59e0b', next: null },
          ]
          const tier     = TIERS.find(t => pts >= t.min && pts <= t.max)
          const nextTier = TIERS.find(t => t.min > pts)
          const progress = nextTier
            ? Math.min((pts - tier.min) / (nextTier.min - tier.min), 1)
            : 1
          const ptsToNext = nextTier ? nextTier.min - pts : 0
          const ptsToReward = 100 - (pts % 100)
          return (
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1800 60%, #1a1a1a 100%)',
              borderRadius: 20, padding: '24px', overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.08)' }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ color: '#fdba74', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                    Programme de fidélité
                  </p>
                  <p style={{ color: '#fff', fontWeight: 900, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {pts.toLocaleString('fr-FR')} <span style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af' }}>points</span>
                  </p>
                </div>
                {/* Badge niveau */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{tier.icon}</div>
                  <p style={{ color: tier.color, fontSize: 10, fontWeight: 800, marginTop: 2, letterSpacing: '0.06em' }}>{tier.name.toUpperCase()}</p>
                </div>
              </div>

              {/* Progression vers niveau suivant */}
              {nextTier && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                      Niveau <span style={{ color: tier.color, fontWeight: 700 }}>{tier.name}</span>
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                      <span style={{ color: nextTier ? '#aaa' : '#f59e0b', fontWeight: 700 }}>{nextTier.name}</span> dans {ptsToNext} pts
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})`, width: `${progress * 100}%`, transition: 'width .5s' }} />
                  </div>
                </div>
              )}
              {!nextTier && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.15)', borderRadius: 20, padding: '4px 10px', marginBottom: 12 }}>
                  <span style={{ fontSize: 11 }}>🏆</span>
                  <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>Niveau maximum atteint !</span>
                </div>
              )}

              {/* Récompense disponible */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                  Encore <span style={{ color: '#fdba74', fontWeight: 700 }}>{ptsToReward % 100} pts</span> pour +500 FCFA
                </p>
                {value > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(249,115,22,0.2)', borderRadius: 20, padding: '4px 10px' }}>
                    <Gift size={11} color={OR} />
                    <span style={{ color: OR, fontSize: 11, fontWeight: 700 }}>{value.toLocaleString('fr-FR')} FCFA disponibles</span>
                  </div>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 10 }}>
                100 pts = 500 FCFA de réduction · 1 pt par tranche de 5 FCFA dépensés
              </p>
            </div>
          )
        })()}
        )}

        {/* Section parrainage */}
        {referral && (
          <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fff)', borderRadius: 20, border: '1px solid #fed7aa', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={18} color="#f97316" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>Inviter un ami</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Vous gagnez 100 pts · votre ami gagne 50 pts</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '10px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>{referral.referral_count}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Ami(s) parrainé(s)</p>
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '10px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#2D6A4F' }}>{referral.points_earned}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Points gagnés</p>
              </div>
            </div>

            {/* Code */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Votre code personnel</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: '#111' }}>{referral.code}</span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(referral.link); toast.success('Lien copié !') }}
                style={{ padding: '10px 14px', background: '#111', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 12, fontWeight: 700 }}>
                <Copy size={14} /> Copier
              </button>
            </div>

            {/* Partage WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🌿 Découvre Sahel Market, la marketplace artisanale camerounaise ! Utilise mon code ${referral.code} à l'inscription pour recevoir +50 points de bienvenue : ${referral.link}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, padding: '11px', background: '#25D366', color: '#fff', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              <Users size={15} /> Inviter via WhatsApp
            </a>
          </div>
        )}

        {/* Historique commandes */}
        <Link to="/orders" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
          padding: '14px 20px', textDecoration: 'none', color: '#111827',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={16} color="#6b7280" />
            <p style={{ fontSize: 13, fontWeight: 600 }}>Mes commandes</p>
          </div>
          <span style={{ color: '#9ca3af', fontSize: 18 }}>→</span>
        </Link>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 24,
        }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 20 }}>
            Informations personnelles
          </p>

          {err && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626',
              display: 'flex', gap: 8,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          )}

          {saved && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
              padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Check size={15} />
              Profil mis à jour avec succès.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={lbl}>Nom d'utilisateur</label>
                <input style={inputStyle} value={form.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={lbl}>Téléphone</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+237 6XX XXX XXX" />
              </div>
              <div>
                <label style={lbl}>WhatsApp</label>
                <input style={inputStyle} type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+237 6XX XXX XXX" />
              </div>
            </div>
            <div>
              <label style={lbl}>Adresse de livraison</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Quartier, ville, région…" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="btn-accent w-full"
            style={{
              marginTop: 20, opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>

        {/* Déconnexion */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#fff', border: '1px solid #fee2e2', borderRadius: 14,
          padding: '14px 20px', color: '#dc2626', fontWeight: 600,
          fontSize: 14, cursor: 'pointer', width: '100%',
        }}>
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
