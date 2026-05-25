import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ProducerOnboarding from '../../components/ProducerOnboarding.jsx'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Package, Eye, TrendingUp, ShoppingBag, Pencil, Trash2,
  ToggleLeft, ToggleRight, X, Upload, ChevronRight, AlertCircle, Info,
  User, Check, Camera, Calendar, Download, AlertTriangle,
} from 'lucide-react'
import api from '../../services/api.js'

const FCFA = v => Number(v || 0).toLocaleString('fr-FR')

/* ─── Palette ─── */
const OR = '#f97316'
const BG = '#f0f2f5'

/* ─── Requêtes ─── */
const fetchDashboard = () => api.get('/dashboard/producer/').then(r => r.data)
const fetchCategories = () => api.get('/products/categories/').then(r => r.data)
const fetchMyProfile = () => api.get('/auth/producer-profile/').then(r => r.data)

/* ─── Composants utilitaires ─── */
function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: '#fff7ed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
      }}>
        <Icon size={18} color={OR} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280' }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</p>}
    </div>
  )
}

function Badge({ ok }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#15803d' : '#dc2626',
    }}>
      {ok ? 'Disponible' : 'Indisponible'}
    </span>
  )
}

/* ─── Onglet Aperçu ─── */
function Overview({ stats }) {
  const chartData = (stats?.products || [])
    .slice(0, 8)
    .map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, views: p.views }))

  const lowStock = stats?.low_stock_products || []

  const exportCsv = () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    const base  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const url   = `${base}/dashboard/producer/export/`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'ventes_sahel_market.csv'
        a.click()
        URL.revokeObjectURL(a.href)
      })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Alertes stock bas */}
      {lowStock.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderLeft: '4px solid #f59e0b', borderRadius: 12, padding: '14px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#d97706" />
            <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
              {lowStock.length} produit{lowStock.length > 1 ? 's' : ''} en stock bas
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lowStock.map(p => (
              <span key={p.id} style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                background: p.stock === 0 ? '#fef2f2' : '#fff7ed',
                border: `1px solid ${p.stock === 0 ? '#fecaca' : '#fed7aa'}`,
                color: p.stock === 0 ? '#dc2626' : '#d97706',
                borderRadius: 20,
              }}>
                {p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name}
                {' — '}
                {p.stock === 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
              </span>
            ))}
          </div>
        </div>
      )}
      {chartData.length > 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24,
        }}>
          <p style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 14 }}>
            Vues par produit
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? OR : '#fcd9b6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Aucun produit encore. Ajoutez votre premier produit pour voir les statistiques.
          </p>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <a href="/products" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: '16px 20px', textDecoration: 'none', color: '#111827',
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Voir le catalogue</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Vos produits en ligne</p>
          </div>
          <ChevronRight size={16} color="#d1d5db" />
        </a>
        <Link to="/legal/faq" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: '16px 20px', textDecoration: 'none', color: '#111827',
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Aide artisans</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>FAQ et bonnes pratiques</p>
          </div>
          <ChevronRight size={16} color="#d1d5db" />
        </Link>
        <button onClick={exportCsv} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Exporter mes ventes</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Télécharger CSV</p>
          </div>
          <Download size={16} color="#22c55e" />
        </button>
      </div>
    </div>
  )
}

/* ─── Formulaire produit (création / édition) ─── */
function ProductForm({ initial, categories, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price || '',
    stock: initial?.stock ?? '',
    location: initial?.location || '',
    category: initial?.category?.id || initial?.category || '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      images.forEach(img => fd.append('images', img))
      if (isEdit) {
        return api.patch(`/products/${initial.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      return api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'producer'] })
      onClose()
    },
    onError: (e) => setErr(e.response?.data ? JSON.stringify(e.response.data) : 'Erreur réseau'),
  })

  const handleFiles = (files) => {
    const arr = Array.from(files)
    setImages(prev => [...prev, ...arr])
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target.result])
      reader.readAsDataURL(f)
    })
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
            {isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {err && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#dc2626',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {err}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nom du produit *</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="ex. Panier tressé en raphia" />
          </div>

          <div>
            <label style={labelStyle}>Description *</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Décrivez votre produit, ses matières, ses dimensions…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Prix (FCFA) *</label>
              <input style={inputStyle} type="number" min="0" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input style={inputStyle} type="number" min="0" value={form.stock}
                onChange={e => set('stock', e.target.value)} placeholder="10" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Localisation</label>
              <input style={inputStyle} value={form.location}
                onChange={e => set('location', e.target.value)} placeholder="Maroua" />
            </div>
            <div>
              <label style={labelStyle}>Catégorie</label>
              <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— Choisir —</option>
                {(categories || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Photos</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
              style={{
                border: '2px dashed #d1d5db', borderRadius: 12, padding: '20px 16px',
                textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
              }}
            >
              <Upload size={24} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Cliquez ou glissez vos photos ici
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                JPG, PNG — La 1ère photo sera la photo principale
              </p>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />
                    {i === 0 && (
                      <span style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        fontSize: 9, textAlign: 'center', borderRadius: '0 0 8px 8px', padding: '2px 0',
                      }}>Principale</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #d1d5db',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            Annuler
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !form.name || !form.price || !form.stock}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 10, border: 'none',
              background: isPending ? '#fdba74' : OR, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Ajouter le produit'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Onglet Mes produits ─── */
function ProductList({ products, categories }) {
  const qc = useQueryClient()
  const [editTarget, setEditTarget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, is_available }) => api.patch(`/products/${id}/`, { is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard', 'producer'] }),
  })

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'producer'] }); setConfirmDelete(null) },
  })

  if (!products?.length) {
    return (
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
        padding: '64px 24px', textAlign: 'center',
      }}>
        <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
          Vous n'avez pas encore de produit.
        </p>
      </div>
    )
  }

  return (
    <>
      {editTarget && (
        <ProductForm initial={editTarget} categories={categories} onClose={() => setEditTarget(null)} />
      )}

      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%' }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>
              Supprimer ce produit ?
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              « {confirmDelete.name} » sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #d1d5db',
                background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>Annuler</button>
              <button onClick={() => del(confirmDelete.id)} disabled={deleting} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* En-tête table */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 80px 110px 88px',
          padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
          fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Produit</span>
          <span style={{ textAlign: 'right' }}>Stock</span>
          <span style={{ textAlign: 'right' }}>Vues</span>
          <span style={{ textAlign: 'center' }}>Statut</span>
          <span />
        </div>

        {products.map((p, i) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 80px 110px 88px',
            padding: '14px 20px', alignItems: 'center',
            borderBottom: i < products.length - 1 ? '1px solid #f9fafb' : 'none',
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                {p.name}
              </p>
              {p.stock <= 3 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px',
                  borderRadius: 20, marginTop: 3, display: 'inline-block',
                  background: p.stock === 0 ? '#fef2f2' : '#fffbeb',
                  color: p.stock === 0 ? '#dc2626' : '#d97706',
                  border: `1px solid ${p.stock === 0 ? '#fecaca' : '#fde68a'}`,
                }}>
                  {p.stock === 0 ? '⚠ Rupture de stock' : `⚠ Stock bas (${p.stock})`}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: p.stock <= 3 ? '#d97706' : '#6b7280', fontWeight: p.stock <= 3 ? 700 : 400, textAlign: 'right' }}>{p.stock}</p>
            <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'right' }}>{p.views}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => toggle({ id: p.id, is_available: !p.is_available })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title={p.is_available ? 'Désactiver' : 'Activer'}
              >
                {p.is_available
                  ? <ToggleRight size={20} color="#16a34a" />
                  : <ToggleLeft size={20} color="#9ca3af" />}
                <Badge ok={p.is_available} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditTarget(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Modifier"
              >
                <Pencil size={14} color="#6b7280" />
              </button>
              <button
                onClick={() => setConfirmDelete(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Supprimer"
              >
                <Trash2 size={14} color="#dc2626" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ─── Onglet Profil artisan ─── */
function ProducerProfileTab() {
  const qc = useQueryClient()
  const fileRef = useRef()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['producer-profile'],
    queryFn: fetchMyProfile,
  })

  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [err, setErr]   = useState(null)

  // Initialise le formulaire quand les données arrivent
  if (profile && form === null) {
    setForm({
      bio:              profile.bio || '',
      speciality:       profile.speciality || '',
      years_experience: profile.years_experience ?? 0,
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      return api.patch('/auth/producer-profile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['producer-profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: () => setErr('Erreur lors de la sauvegarde.'),
  })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('workshop_photo', file)
    api.patch('/auth/producer-profile/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(() => qc.invalidateQueries({ queryKey: ['producer-profile'] }))
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const input = {
    width: '100%', padding: '11px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111827',
  }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }

  if (isLoading || !form) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

      {/* Carte photo atelier */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 120, height: 120, borderRadius: 20, overflow: 'hidden',
            background: '#f9fafb', border: '2px solid #e5e7eb', margin: '0 auto',
          }}>
            {profile?.workshop_photo
              ? <img src={profile.workshop_photo} alt="Atelier" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} color="#d1d5db" />
                </div>
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 32, height: 32, borderRadius: '50%',
              background: OR, border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Camera size={14} color="#fff" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>

        <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
          {profile?.first_name || profile?.username}
        </p>
        {profile?.speciality && (
          <p style={{ fontSize: 13, color: OR, marginTop: 4, fontWeight: 600 }}>{profile.speciality}</p>
        )}
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
          {profile?.products_count} produit{profile?.products_count !== 1 ? 's' : ''} en ligne
        </p>

        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6',
          fontSize: 12, color: '#9ca3af',
        }}>
          <p>Artisan depuis</p>
          <p style={{ fontWeight: 700, color: '#374151', fontSize: 14, marginTop: 2 }}>
            {profile?.date_joined
              ? new Date(profile.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : '—'}
          </p>
        </div>

        {/* Lien profil public */}
        {profile?.username && (
          <a
            href={`/artisans/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', marginTop: 16, padding: '9px 0', borderRadius: 10,
              border: `1px solid ${OR}`, color: OR, fontSize: 13,
              fontWeight: 700, textDecoration: 'none',
            }}
          >
            Voir mon profil public →
          </a>
        )}
      </div>

      {/* Formulaire */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 20 }}>
          Informations artisan
        </p>

        {err && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {err}
          </div>
        )}
        {saved && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <Check size={14} /> Profil mis à jour avec succès.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Spécialité artisanale</label>
            <input style={input} value={form.speciality}
              onChange={e => set('speciality', e.target.value)}
              placeholder="Ex : Vannerie, Broderie sur cuir, Bijoux en bronze…" />
          </div>

          <div>
            <label style={lbl}>Années d'expérience</label>
            <input style={{ ...input, width: 120 }} type="number" min="0" max="60"
              value={form.years_experience}
              onChange={e => set('years_experience', e.target.value)} />
          </div>

          <div>
            <label style={lbl}>Présentation / Bio</label>
            <textarea
              style={{ ...input, resize: 'vertical', minHeight: 120 }}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Parlez de vous, de votre atelier, de vos techniques de fabrication et de votre histoire…"
            />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {form.bio.length} caractère{form.bio.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isPending}
          style={{
            marginTop: 20, width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
            background: isPending ? '#fdba74' : OR, color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer mon profil'}
        </button>
      </div>
    </div>
  )
}

/* ─── Onglet Commandes ─── */
const STATUS_COLORS = {
  pending:    { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  paid:       { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  processing: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  shipped:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}
const STATUS_LABELS = {
  pending: 'En attente', paid: 'Payée', processing: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}
const FCFA_FMT = v => Number(v || 0).toLocaleString('fr-FR')

function OrdersTab() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['dashboard', 'producer', 'orders'],
    queryFn:  () => api.get('/dashboard/producer/orders/').then(r => r.data),
    staleTime: 60_000,
  })
  const [filter, setFilter] = useState('all')

  const list = Array.isArray(orders) ? orders : []
  const filtered = filter === 'all' ? list : list.filter(o => o.status === filter)

  const filterBtns = [
    { id: 'all',        label: 'Toutes' },
    { id: 'pending',    label: 'En attente' },
    { id: 'paid',       label: 'Payées' },
    { id: 'processing', label: 'En préparation' },
    { id: 'shipped',    label: 'Expédiées' },
    { id: 'delivered',  label: 'Livrées' },
  ]

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
  )

  if (list.length === 0) return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '48px 24px', textAlign: 'center',
    }}>
      <ShoppingBag size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} strokeWidth={1} />
      <p style={{ color: '#9ca3af', fontSize: 14 }}>Aucune commande pour le moment.</p>
      <p style={{ color: '#d1d5db', fontSize: 12, marginTop: 6 }}>
        Vos commandes apparaîtront ici dès qu'un client achètera vos produits.
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {filterBtns.map(f => {
          const count = f.id === 'all' ? list.length : list.filter(o => o.status === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: '1px solid',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                borderColor: filter === f.id ? OR : '#e5e7eb',
                background:  filter === f.id ? '#fff7ed' : '#fff',
                color:       filter === f.id ? OR : '#6b7280',
                transition: 'all .12s',
              }}
            >
              {f.label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune commande dans cette catégorie.</p>
        </div>
      ) : filtered.map(order => {
        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
        return (
          <div key={order.id} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden',
          }}>
            {/* En-tête commande */}
            <div style={{
              padding: '14px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
              borderBottom: '1px solid #f3f4f6', background: '#fafafa',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>
                  #{order.id}
                </span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  · {order.client}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                }}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>
                  {FCFA_FMT(order.my_total)} FCFA
                </span>
              </div>
            </div>
            {/* Articles */}
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 13, color: '#374151',
                }}>
                  <span>
                    <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 6 }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{FCFA_FMT(item.subtotal)} FCFA</span>
                </div>
              ))}
              {order.delivery_address && (
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  📍 {order.delivery_address}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Écran en attente de validation ─── */
function PendingValidation({ user }) {
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <div style={{ background: '#1a1a1a', padding: '36px 0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Espace artisan
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Bienvenue, {user?.first_name || user?.username}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
          padding: 40, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff7ed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span style={{ fontSize: 32 }}>⏳</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            Compte en attente de validation
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Votre inscription en tant qu'artisan a bien été reçue. L'équipe Sahel Market
            examine votre profil et vous contactera sous <strong>48 heures</strong> pour
            valider votre compte.
          </p>

          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
            padding: '14px 20px', marginBottom: 24, fontSize: 13, color: '#15803d', lineHeight: 1.6,
          }}>
            Une fois validé, vous pourrez gérer vos produits et suivre vos ventes depuis ce tableau de bord.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="mailto:sahelmarket@gmail.com" style={{
              display: 'block', padding: '12px 0', borderRadius: 12, border: `2px solid ${OR}`,
              color: OR, textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}>
              Contacter l'équipe
            </a>
            <a href="tel:+237680757871" style={{
              display: 'block', padding: '12px 0', borderRadius: 12,
              border: '1px solid #e5e7eb', color: '#6b7280',
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}>
              +237 680 757 871
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Composant principal ─── */
export default function ProducerDashboard() {
  const user = useSelector(s => s.auth.user)
  const [tab, setTab] = useState('overview')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const key = `onboarding_done_${user?.id}`
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true)
      localStorage.setItem(key, '1')
    }
  }, [user?.id])

  if (!user?.is_verified) return <PendingValidation user={user} />

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'producer'],
    queryFn: fetchDashboard,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const kpis = [
    { icon: Package, label: 'Produits en ligne', value: stats?.products_count ?? '—' },
    { icon: Eye, label: 'Vues totales', value: stats?.total_views != null ? FCFA(stats.total_views) : '—' },
    { icon: TrendingUp, label: 'Revenus (FCFA)', value: stats?.revenue != null ? FCFA(stats.revenue) : '—', sub: 'commandes livrées' },
    { icon: ShoppingBag, label: 'Commandes', value: stats?.orders_count ?? '—' },
  ]

  const tabs = [
    { id: 'overview', label: 'Aperçu' },
    { id: 'products', label: `Mes produits${stats?.products_count ? ` (${stats.products_count})` : ''}` },
    { id: 'orders',   label: 'Commandes' },
    { id: 'profile',  label: 'Mon profil artisan' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {showOnboarding && (
        <ProducerOnboarding onClose={() => setShowOnboarding(false)} />
      )}

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '36px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Espace artisan
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Bonjour, {user?.first_name || user?.username} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            Gérez vos produits et suivez vos ventes depuis votre tableau de bord.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
          {kpis.map(k => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* Analytics hebdomadaires */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #111827 100%)',
          borderRadius: 16, padding: '16px 24px', marginBottom: 32,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, gridColumn: '1/-1', marginBottom: 12 }}>
            <Calendar size={13} color='#f97316' />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                           textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Performances récentes
            </span>
          </div>
          {[
            { label: '7 derniers jours', value: stats?.weekly_revenue != null ? `${FCFA(stats.weekly_revenue)} FCFA` : '—', sub: `${stats?.weekly_orders ?? 0} commande${(stats?.weekly_orders ?? 0) !== 1 ? 's' : ''}`, color: '#fb923c', last: false },
            { label: '30 derniers jours', value: stats?.monthly_revenue != null ? `${FCFA(stats.monthly_revenue)} FCFA` : '—', sub: 'revenus du mois', color: '#34d399', last: false },
            { label: 'Total cumulé', value: stats?.revenue != null ? `${FCFA(stats.revenue)} FCFA` : '—', sub: "depuis l'ouverture", color: '#60a5fa', last: true },
          ].map(({ label, value, sub, color, last }) => (
            <div key={label} style={{ paddingRight: last ? 0 : 20, borderRight: last ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Info ajout produit */}
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12,
          padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1e40af',
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Pour référencer de nouveaux produits sur la plateforme, contactez l'équipe Sahel Market :
            <a href="mailto:sahelmarket@gmail.com" style={{ fontWeight: 700, marginLeft: 4, color: '#1d4ed8' }}>
              sahelmarket@gmail.com
            </a>
          </span>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: tab === t.id ? OR : 'transparent',
                  color: tab === t.id ? '#fff' : '#6b7280',
                  transition: 'all .15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu onglet */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
            Chargement…
          </div>
        ) : tab === 'overview' ? (
          <Overview stats={stats} />
        ) : tab === 'products' ? (
          <ProductList products={stats?.products} categories={categories?.results || categories} />
        ) : tab === 'orders' ? (
          <OrdersTab />
        ) : (
          <ProducerProfileTab />
        )}

      </div>
    </div>
  )
}
