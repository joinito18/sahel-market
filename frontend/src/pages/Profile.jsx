import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Check, AlertCircle, LogOut, ShoppingBag, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import { updateUser, logout } from '../store/authSlice.js'

const OR = '#f97316'
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
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '40px 0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Mon compte
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
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
              background: '#fff7ed', border: `3px solid ${OR}`,
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
              padding: '3px 10px', borderRadius: 20, background: '#fff7ed', color: OR,
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Nom d'utilisateur</label>
                <input style={inputStyle} value={form.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

          <button type="submit" disabled={saving} style={{
            marginTop: 20, width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
            background: saving ? '#fdba74' : OR, color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
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
