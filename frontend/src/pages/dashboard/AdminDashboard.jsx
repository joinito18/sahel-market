import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, ShoppingBag, TrendingUp, AlertTriangle, Package, Store,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Upload, AlertCircle,
  Search, CheckCircle, XCircle,
} from 'lucide-react'
import api from '../../services/api.js'

const FCFA = v => Number(v || 0).toLocaleString('fr-FR')
const OR = '#2D6A4F'
const BG = '#f0f2f5'

/* ─── Requêtes ─── */
const fetchGlobal   = () => api.get('/dashboard/global/').then(r => r.data)
const fetchPending  = () => api.get('/auth/producers/pending/').then(r => r.data)
const fetchProducts = (page, search) =>
  api.get('/products/', { params: { page, search: search || undefined, page_size: 20 } }).then(r => r.data)
const fetchProducers  = () => api.get('/auth/producers/').then(r => r.data)
const fetchCategories = () => api.get('/products/categories/').then(r => r.data)

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 2,
        background: accent ? `${accent}18` : '#eff8f3',
      }}>
        <Icon size={17} color={accent || OR} />
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#9ca3af' }}>{label}</p>
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

/* ─── Formulaire produit admin ─── */
function ProductForm({ initial, categories, producers, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    name:        initial?.name || '',
    description: initial?.description || '',
    price:       initial?.price || '',
    stock:       initial?.stock ?? '',
    location:    initial?.location || '',
    category:    initial?.category?.id || initial?.category || '',
    producer_id: initial?.producer_id || '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      images.forEach(img => fd.append('images', img))
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      return isEdit
        ? api.patch(`/products/${initial.id}/`, fd, cfg)
        : api.post('/products/', fd, cfg)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
      onClose()
    },
    onError: e => setErr(e.response?.data ? JSON.stringify(e.response.data) : 'Erreur réseau'),
  })

  const handleFiles = files => {
    const arr = Array.from(files)
    setImages(p => [...p, ...arr])
    arr.forEach(f => {
      const r = new FileReader()
      r.onload = e => setPreviews(p => [...p, e.target.result])
      r.readAsDataURL(f)
    })
  }

  const input = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580,
        maxHeight: '92vh', overflowY: 'auto', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {err && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#dc2626',
            display: 'flex', gap: 8,
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {err}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Artisan */}
          {!isEdit && (
            <div>
              <label style={lbl}>Artisan *</label>
              <select style={input} value={form.producer_id} onChange={e => set('producer_id', e.target.value)}>
                <option value="">— Choisir un artisan —</option>
                {(producers || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name || p.username} ({p.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={lbl}>Nom du produit *</label>
            <input style={input} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="ex. Panier tressé en raphia" />
          </div>

          <div>
            <label style={lbl}>Description *</label>
            <textarea style={{ ...input, resize: 'vertical', minHeight: 90 }}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Décrivez le produit, ses matières, ses dimensions…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Prix (FCFA) *</label>
              <input style={input} type="number" min="0" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label style={lbl}>Stock *</label>
              <input style={input} type="number" min="0" value={form.stock}
                onChange={e => set('stock', e.target.value)} placeholder="10" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Localisation</label>
              <input style={input} value={form.location}
                onChange={e => set('location', e.target.value)} placeholder="Maroua" />
            </div>
            <div>
              <label style={lbl}>Catégorie</label>
              <select style={input} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— Catégorie —</option>
                {(categories || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Photos</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
              style={{
                border: '2px dashed #d1d5db', borderRadius: 12, padding: '20px 16px',
                textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
              }}
            >
              <Upload size={22} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: '#6b7280' }}>Cliquez ou glissez vos photos</p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                La 1ère photo sera la photo principale
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
            disabled={isPending || !form.name || !form.price || !form.stock || (!isEdit && !form.producer_id)}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 10, border: 'none',
              background: isPending ? '#fdba74' : OR, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Onglet Produits ─── */
function ProductsTab({ categories, producers }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, debouncedSearch],
    queryFn: () => fetchProducts(page, debouncedSearch),
  })

  const products = data?.results || (Array.isArray(data) ? data : [])
  const total = data?.count || products.length

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, is_available }) => api.patch(`/products/${id}/`, { is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: id => api.delete(`/products/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
      setConfirmDelete(null)
    },
  })

  const handleSearch = e => {
    setSearch(e.target.value)
    clearTimeout(window._st)
    window._st = setTimeout(() => { setDebouncedSearch(e.target.value); setPage(1) }, 400)
  }

  return (
    <>
      {(showForm || editTarget) && (
        <ProductForm
          initial={editTarget}
          categories={categories}
          producers={producers}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
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
              « {confirmDelete.name} » sera définitivement supprimé.
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

      {/* Barre outils */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher un produit…"
            style={{
              width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #e5e7eb',
              borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
              fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: OR, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={15} /> Ajouter un produit
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 130px 70px 70px 110px 80px',
            padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
            fontSize: 11, fontWeight: 700, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Produit</span>
            <span>Artisan</span>
            <span style={{ textAlign: 'right' }}>Prix</span>
            <span style={{ textAlign: 'right' }}>Stock</span>
            <span style={{ textAlign: 'center' }}>Statut</span>
            <span />
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Aucun produit trouvé.
            </div>
          ) : products.map((p, i) => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 130px 70px 70px 110px 80px',
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < products.length - 1 ? '1px solid #f9fafb' : 'none',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{p.name}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{p.producer_name || '—'}</p>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'right' }}>
                {FCFA(p.price)}
              </p>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'right' }}>{p.stock}</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => toggle({ id: p.id, is_available: !p.is_available })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
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
                >
                  <Pencil size={13} color="#6b7280" />
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2',
                    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer',
              color: page === 1 ? '#d1d5db' : '#374151',
            }}
          >
            ← Précédent
          </button>
          <span style={{ padding: '8px 12px', fontSize: 13, color: '#6b7280' }}>
            Page {page} · {total} produits
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={products.length < 20}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13, cursor: products.length < 20 ? 'not-allowed' : 'pointer',
              color: products.length < 20 ? '#d1d5db' : '#374151',
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </>
  )
}

/* ─── Onglet Artisans ─── */
function ProducersTab({ producers, isLoading }) {
  if (isLoading) return <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>

  const list = Array.isArray(producers) ? producers : (producers?.results || [])

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 100px 100px',
        padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
        fontSize: 11, fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        <span>Artisan</span>
        <span>Ville</span>
        <span style={{ textAlign: 'center' }}>Statut</span>
        <span style={{ textAlign: 'right' }}>Inscrit le</span>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          Aucun artisan enregistré.
        </div>
      ) : list.map((p, i) => (
        <div key={p.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 100px 100px',
          padding: '14px 20px', alignItems: 'center',
          borderBottom: i < list.length - 1 ? '1px solid #f9fafb' : 'none',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
              {p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : p.username}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{p.email}</p>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{p.city || '—'}</p>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: p.is_active ? '#dcfce7' : '#f3f4f6',
              color: p.is_active ? '#15803d' : '#9ca3af',
            }}>
              {p.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
            {p.date_joined ? new Date(p.date_joined).toLocaleDateString('fr-FR') : '—'}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ─── Onglet Validations ─── */
function ValidationTab() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['producers-pending'],
    queryFn: fetchPending,
    refetchInterval: 30000,
  })
  const pending = Array.isArray(data) ? data : []

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, action }) =>
      api.patch(`/auth/producers/${id}/validate/`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['producers-pending'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
      qc.invalidateQueries({ queryKey: ['producers'] })
    },
  })

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
  )

  if (pending.length === 0) return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '56px 24px', textAlign: 'center',
    }}>
      <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px' }} />
      <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 6 }}>
        Aucune demande en attente
      </p>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>
        Tous les comptes artisans ont été traités.
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        background: '#eff8f3', border: '1px solid #add8bc', borderRadius: 12,
        padding: '12px 16px', fontSize: 13, color: '#92400e',
      }}>
        <strong>{pending.length}</strong> compte{pending.length > 1 ? 's' : ''} artisan{pending.length > 1 ? 's' : ''} en attente de validation.
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {pending.map((p, i) => {
          const displayName = p.first_name
            ? `${p.first_name} ${p.last_name || ''}`.trim()
            : p.username

          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderBottom: i < pending.length - 1 ? '1px solid #f3f4f6' : 'none',
              flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#eff8f3', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: OR, fontSize: 18, border: `2px solid #add8bc`,
              }}>
                {displayName[0].toUpperCase()}
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{displayName}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.email}</p>
                {p.phone && (
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{p.phone}</p>
                )}
              </div>

              {/* Date */}
              <p style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                {new Date(p.date_joined).toLocaleDateString('fr-FR')}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => mutate({ id: p.id, action: 'approve' })}
                  disabled={isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#16a34a', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={14} /> Approuver
                </button>
                <button
                  onClick={() => mutate({ id: p.id, action: 'reject' })}
                  disabled={isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    border: '1px solid #fecaca', background: '#fff',
                    color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <XCircle size={14} /> Rejeter
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Composant principal ─── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn: fetchGlobal,
  })

  const { data: producers, isLoading: loadingProducers } = useQuery({
    queryKey: ['producers'],
    queryFn: fetchProducers,
  })

  const { data: pendingData } = useQuery({
    queryKey: ['producers-pending'],
    queryFn: fetchPending,
    refetchInterval: 30000,
  })
  const pendingCount = Array.isArray(pendingData) ? pendingData.length : 0

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const catList = categories?.results || (Array.isArray(categories) ? categories : [])
  const prodList = Array.isArray(producers) ? producers : (producers?.results || [])

  const kpis = [
    { icon: TrendingUp, label: 'Ventes totales',       value: stats?.total_sales ? `${FCFA(stats.total_sales)} F` : '—' },
    { icon: TrendingUp, label: 'Ventes ce mois',       value: stats?.monthly_sales ? `${FCFA(stats.monthly_sales)} F` : '—', accent: '#2563eb' },
    { icon: Users,      label: 'Clients actifs',       value: stats?.active_clients ?? '—', accent: '#2563eb' },
    { icon: Store,      label: 'Artisans',             value: stats?.total_producers ?? '—', accent: '#7c3aed' },
    { icon: Package,    label: 'Produits',             value: stats?.total_products ?? '—', accent: '#7c3aed' },
    { icon: ShoppingBag,label: 'Commandes en attente', value: stats?.pending_orders ?? '—', accent: '#d97706' },
    { icon: AlertTriangle, label: 'Litiges',           value: stats?.disputes ?? '—', accent: '#dc2626' },
    { icon: Users,      label: 'Utilisateurs total',   value: stats?.total_users ?? '—', accent: '#6b7280' },
  ]

  const tabs = [
    { id: 'overview',    label: 'Aperçu' },
    { id: 'products',    label: `Produits${stats?.total_products ? ` (${stats.total_products})` : ''}` },
    { id: 'producers',   label: `Artisans${stats?.total_producers ? ` (${stats.total_producers})` : ''}` },
    { id: 'validations', label: 'Validations', badge: pendingCount },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '36px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Administration
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Tableau de bord
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            Vue globale de la plateforme Sahel Market
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, position: 'relative',
                  background: tab === t.id ? OR : 'transparent',
                  color: tab === t.id ? '#fff' : '#6b7280',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t.label}
                {t.badge > 0 && (
                  <span style={{
                    background: tab === t.id ? '#fff' : '#dc2626',
                    color: tab === t.id ? '#dc2626' : '#fff',
                    fontSize: 10, fontWeight: 800, lineHeight: 1,
                    padding: '2px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center',
                  }}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu onglets */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pendingCount > 0 && (
              <div style={{
                background: '#eff8f3', border: '1px solid #add8bc', borderRadius: 14,
                padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <AlertTriangle size={20} color="#2D6A4F" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
                    {pendingCount} compte{pendingCount > 1 ? 's' : ''} artisan{pendingCount > 1 ? 's' : ''} en attente de validation
                  </p>
                  <p style={{ fontSize: 13, color: '#b45309' }}>
                    Des artisans attendent votre approbation pour accéder à leur boutique.
                  </p>
                </div>
                <button
                  onClick={() => setTab('validations')}
                  style={{
                    padding: '8px 18px', borderRadius: 9, border: 'none',
                    background: OR, color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Valider →
                </button>
              </div>
            )}
            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
              padding: '40px 24px', textAlign: 'center', color: '#9ca3af',
            }}>
              <TrendingUp size={36} style={{ margin: '0 auto 12px' }} color="#e5e7eb" />
              <p style={{ fontSize: 14 }}>
                Le graphique de ventes historiques sera disponible après accumulation des données.
              </p>
              <p style={{ fontSize: 12, marginTop: 6 }}>
                Consultez les onglets <strong>Produits</strong> et <strong>Artisans</strong> pour gérer la plateforme.
              </p>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <ProductsTab categories={catList} producers={prodList} />
        )}

        {tab === 'producers' && (
          <ProducersTab producers={prodList} isLoading={loadingProducers} />
        )}

        {tab === 'validations' && <ValidationTab />}
      </div>
    </div>
  )
}
