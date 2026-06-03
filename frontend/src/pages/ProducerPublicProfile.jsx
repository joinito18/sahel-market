import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { User, Package, Star, Calendar, Sparkles } from 'lucide-react'
import api from '../services/api.js'
import ProductCard from '../components/ProductCard.jsx'
import CustomOrderModal from '../components/CustomOrderModal.jsx'

const OR  = '#2D6A4F'
const BG  = '#f0f2f5'
const FCFA = n => Number(n).toLocaleString('fr-FR')

const fetchPublicProfile = (username) =>
  api.get(`/auth/producers/`).then(r => {
    const list = Array.isArray(r.data) ? r.data : (r.data?.results || [])
    const user = list.find(u => u.username === username)
    if (!user) throw new Error('Artisan introuvable')
    return user
  })

const fetchProducerDetail = (userId) =>
  api.get(`/auth/producers/${userId}/`).then(r => r.data)

export default function ProducerPublicProfile() {
  const { username } = useParams()
  const { isAuthenticated } = useSelector(s => s.auth)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: user, isLoading: loadingUser, error } = useQuery({
    queryKey: ['producer-public', username],
    queryFn: () => fetchPublicProfile(username),
    enabled: !!username,
  })

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['producer-detail', user?.id],
    queryFn: () => fetchProducerDetail(user.id),
    enabled: !!user?.id,
  })

  const profile  = detail?.profile
  const products = detail?.products || []

  if (loadingUser) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
      Chargement…
    </div>
  )

  if (error || !user) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <User size={48} color="#d1d5db" strokeWidth={1} />
      <p style={{ color: '#6b7280', fontSize: 15 }}>Artisan introuvable.</p>
      <Link to="/products" style={{ color: OR, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
        Retour au catalogue →
      </Link>
    </div>
  )

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.username

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header artisan */}
      <div style={{ background: '#1a1a1a', padding: '48px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>

            {/* Photo / Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: 20, overflow: 'hidden', flexShrink: 0,
              background: '#eff8f3', border: `3px solid ${OR}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {profile?.workshop_photo
                ? <img src={profile.workshop_photo} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.avatar
                  ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 36, fontWeight: 900, color: OR }}>
                      {displayName[0].toUpperCase()}
                    </span>
              }
            </div>

            {/* Infos */}
            <div style={{ flex: 1 }}>
              <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Artisan Sahel Market
              </p>
              <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
                {displayName}
              </h1>

              {profile?.speciality && (
                <p style={{ color: OR, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  {profile.speciality}
                </p>
              )}

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {profile?.years_experience > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    <Star size={13} color={OR} />
                    <span>{profile.years_experience} an{profile.years_experience > 1 ? 's' : ''} d'expérience</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  <Package size={13} />
                  <span>{products.length} produit{products.length > 1 ? 's' : ''} en ligne</span>
                </div>
                {user.date_joined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    <Calendar size={13} />
                    <span>Membre depuis {new Date(user.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px 60px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Bio */}
        {profile?.bio && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>
              À propos
            </p>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Photo atelier */}
        {profile?.workshop_photo && (
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <img
              src={profile.workshop_photo}
              alt="Atelier de fabrication"
              style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Produits */}
        <div>
          <p style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>
            Créations de {displayName}
          </p>

          {loadingDetail ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>Chargement…</div>
          ) : products.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
              padding: '48px 24px', textAlign: 'center',
            }}>
              <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} strokeWidth={1} />
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

        {/* Contact */}
        <div style={{
          background: '#eff8f3', border: '1px solid #add8bc', borderRadius: 16,
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>Vous avez un projet sur-mesure ?</p>
            <p style={{ color: '#b45309', fontSize: 13, marginTop: 4 }}>
              Envoyez votre demande via Sahel Market — toutes les communications restent sur la plateforme.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: '#111111', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}
          >
            <Sparkles size={15} />
            Commander sur-mesure
          </button>
        </div>
      </div>

      <CustomOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        producer={user}
      />
    </div>
  )
}
