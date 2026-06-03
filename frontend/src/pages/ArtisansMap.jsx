import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Package, Search, X, BadgeCheck } from 'lucide-react'
import api from '../services/api.js'
import { imgUrl } from '../utils/media.js'

// Leaflet CSS — chargé une seule fois
import 'leaflet/dist/leaflet.css'

const CAMEROON_CENTER = [5.5, 12.3]
const DEFAULT_ZOOM    = 6

/* ── Fetch artisans ──────────────────────────────────────────────── */
const fetchArtisans = () => api.get('/users/artisans/map/').then(r => r.data)

/* ── Composant carte ─────────────────────────────────────────────── */
export default function ArtisansMap() {
  const mapRef      = useRef(null)
  const leafletRef  = useRef(null)
  const markersRef  = useRef([])
  const [selected,  setSelected]  = useState(null)
  const [search,    setSearch]    = useState('')

  const { data: artisans = [], isLoading } = useQuery({
    queryKey: ['artisans-map'],
    queryFn:  fetchArtisans,
  })

  /* Filtre par recherche */
  const filtered = artisans.filter(a =>
    !search || [a.name, a.city, a.speciality].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  /* Initialiser Leaflet */
  useEffect(() => {
    if (leafletRef.current) return

    import('leaflet').then(L => {
      const Leaflet = L.default

      // Fix icônes par défaut (problème courant avec Vite)
      delete Leaflet.Icon.Default.prototype._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = Leaflet.map(mapRef.current, {
        center:          CAMEROON_CENTER,
        zoom:            DEFAULT_ZOOM,
        zoomControl:     true,
        scrollWheelZoom: true,
      })

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      leafletRef.current = { map, L: Leaflet }
    })

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove()
        leafletRef.current = null
      }
    }
  }, [])

  /* Mettre à jour les marqueurs quand les données changent */
  useEffect(() => {
    if (!leafletRef.current) return
    const { map, L } = leafletRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    filtered.forEach(artisan => {
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:40px; height:40px; border-radius:50%;
            background:#111; border:3px solid #d97706;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
            overflow:hidden; cursor:pointer;
            font-family:'Cormorant Garamond',Georgia,serif;
            font-size:16px; font-weight:700; color:#d97706;
          ">${artisan.name?.[0]?.toUpperCase() || '?'}</div>
        `,
        iconSize:   [40, 40],
        iconAnchor: [20, 40],
      })

      const marker = L.marker([artisan.lat, artisan.lng], { icon })
        .addTo(map)
        .on('click', () => setSelected(artisan))

      markersRef.current.push(marker)
    })
  }, [filtered.length, search])

  const cities = [...new Set(artisans.map(a => a.city).filter(Boolean))]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4EF' }}>

      {/* ── EN-TÊTE ─────────────────────────────────────────────── */}
      <div style={{ background: '#111111', padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            Sahel Market
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif,"Cormorant Garamond",Georgia,serif)',
            fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 700, color: '#fff',
            lineHeight: 1.1, marginBottom: 12,
          }}>
            Nos artisans,<br />
            <em style={{ color: '#d97706' }}>sur la carte</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 520 }}>
            Découvrez les artisans vérifiés de Sahel Market à travers le Cameroun.
            Chaque point représente un savoir-faire ancestral, accessible directement depuis chez vous.
          </p>

          {/* Stats rapides */}
          <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { v: artisans.length, label: 'Artisans sur la carte' },
              { v: cities.length,  label: 'Villes couvertes' },
              { v: artisans.reduce((s, a) => s + (a.product_count || 0), 0), label: 'Produits disponibles' },
            ].map(({ v, label }) => (
              <div key={label}>
                <p style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,4vw,40px)' }}>

        {/* Barre de recherche */}
        <div style={{ position: 'relative', maxWidth: 400, marginBottom: 20 }}>
          <Search size={14} color="#ADADAD" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, ville, spécialité…"
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid #E8E7E2', borderRadius: 10,
              padding: '10px 36px 10px 34px', fontSize: 13, outline: 'none',
              background: '#fff', color: '#111', fontFamily: 'inherit',
              transition: 'border-color .15s',
            }}
            onFocus={e => e.target.style.borderColor = '#d97706'}
            onBlur={e  => e.target.style.borderColor = '#E8E7E2'}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={13} color="#ADADAD" />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ── CARTE ─────────────────────────────────────────── */}
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #E8E7E2',
            height: 'clamp(380px, 60vh, 600px)',
            position: 'relative',
          }}>
            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: 'rgba(245,244,239,0.85)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid #E8E7E2', borderTopColor: '#d97706', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 12, color: '#ADADAD' }}>Chargement de la carte…</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
              </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* ── LISTE ARTISANS ────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'clamp(380px, 60vh, 600px)', overflowY: 'auto' }}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #E8E7E2' }}>
                    <div style={{ width: '60%', height: 10, background: '#EDECEA', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: '40%', height: 8, background: '#EDECEA', borderRadius: 4 }} />
                  </div>
                ))
              : filtered.length === 0
                ? (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '32px 20px', textAlign: 'center', border: '1px solid #E8E7E2' }}>
                    <MapPin size={28} color="#E8E7E2" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: '#ADADAD' }}>Aucun artisan trouvé</p>
                  </div>
                )
                : filtered.map(artisan => (
                  <button
                    key={artisan.id}
                    onClick={() => {
                      setSelected(artisan)
                      if (leafletRef.current) {
                        leafletRef.current.map.flyTo([artisan.lat, artisan.lng], 10, { duration: 0.8 })
                      }
                    }}
                    style={{
                      background: selected?.id === artisan.id ? '#FFF7ED' : '#fff',
                      border: `1.5px solid ${selected?.id === artisan.id ? '#d97706' : '#E8E7E2'}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#111111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-serif,"Cormorant Garamond",Georgia,serif)',
                      fontSize: 17, fontWeight: 700, color: '#d97706',
                    }}>
                      {artisan.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>
                        {artisan.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#ADADAD', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={9} /> {artisan.city}
                        {artisan.speciality && <> · {artisan.speciality}</>}
                      </p>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: '#6B6B6B',
                      background: '#F5F4EF', borderRadius: 6, padding: '3px 7px',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {artisan.product_count} produit{artisan.product_count > 1 ? 's' : ''}
                    </div>
                  </button>
                ))
            }
          </div>
        </div>

        {/* ── POPUP ARTISAN SÉLECTIONNÉ ──────────────────────── */}
        {selected && (
          <div style={{
            marginTop: 20, background: '#fff', borderRadius: 16,
            border: '1.5px solid #d97706',
            padding: '20px',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: '#111111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif,"Cormorant Garamond",Georgia,serif)',
              fontSize: 26, fontWeight: 700, color: '#d97706',
            }}>
              {selected.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{selected.name}</p>
                <BadgeCheck size={14} color="#2D6A4F" />
              </div>
              {selected.speciality && <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 3 }}>{selected.speciality}</p>}
              <p style={{ fontSize: 11, color: '#ADADAD', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={9} /> {selected.city} · {selected.product_count} produit{selected.product_count > 1 ? 's' : ''} disponible{selected.product_count > 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <Link
                to={`/artisans/${selected.username}`}
                style={{
                  padding: '10px 18px', borderRadius: 10,
                  background: '#111', color: '#fff',
                  fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Package size={13} /> Voir les produits
              </Link>
              <button onClick={() => setSelected(null)}
                style={{
                  padding: '10px', borderRadius: 10, border: '1px solid #E8E7E2',
                  background: '#fff', cursor: 'pointer',
                }}>
                <X size={14} color="#ADADAD" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive mobile — carte pleine largeur */}
      <style>{`
        @media (max-width: 767px) {
          .map-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
