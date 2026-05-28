import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, ShoppingBag, TrendingUp, AlertTriangle, Package, Store,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Upload, AlertCircle,
  Search, CheckCircle, XCircle, LayoutDashboard, ShoppingCart, BadgeCheck,
  ChevronDown, ChevronUp, MapPin, CreditCard, Clock, Truck, Star,
  BarChart2, Filter,
} from 'lucide-react'
import api from '../../services/api.js'

const FCFA = v => Number(v || 0).toLocaleString('fr-FR')
const OR   = '#2D6A4F'
const OR2  = '#1a4431'

/* ─── API ─── */
const fetchGlobal    = () => api.get('/dashboard/global/').then(r => r.data)
const fetchPending   = () => api.get('/auth/producers/pending/').then(r => r.data)
const fetchProducts  = (page, search) =>
  api.get('/products/', { params: { page, search: search || undefined, page_size: 20 } }).then(r => r.data)
const fetchProducers  = () => api.get('/auth/producers/').then(r => r.data)
const fetchCategories = () => api.get('/products/categories/').then(r => r.data)
const fetchOrders     = (status) =>
  api.get('/orders/manage/', { params: status ? { status } : {} }).then(r => r.data)

/* ─── Statuts commandes ─── */
const STATUS_CFG = {
  pending:    { label: 'En attente',    bg: '#fef9c3', color: '#92400e',  dot: '#f59e0b' },
  paid:       { label: 'Payé',          bg: '#dbeafe', color: '#1e40af',  dot: '#3b82f6' },
  processing: { label: 'En préparation',bg: '#ede9fe', color: '#5b21b6',  dot: '#8b5cf6' },
  shipped:    { label: 'Expédié',       bg: '#d6eddf', color: '#194328',  dot: '#22c55e' },
  delivered:  { label: 'Livré',         bg: '#dcfce7', color: '#15803d',  dot: '#16a34a' },
  cancelled:  { label: 'Annulé',        bg: '#fee2e2', color: '#dc2626',  dot: '#ef4444' },
}
const STATUS_NEXT = {
  pending:    ['paid', 'cancelled'],
  paid:       ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}
const METHOD_LABELS = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', cash: 'Espèces à la livraison' }

/* ─── Nav items ─── */
const NAV = [
  { id: 'overview',    label: 'Aperçu',      Icon: LayoutDashboard },
  { id: 'orders',      label: 'Commandes',   Icon: ShoppingCart    },
  { id: 'products',    label: 'Produits',    Icon: Package         },
  { id: 'producers',   label: 'Artisans',    Icon: Store           },
  { id: 'validations', label: 'Validations', Icon: BadgeCheck      },
]

/* ══════════════════════════════════════════════════════════
   KPI Card
══════════════════════════════════════════════════════════ */
function KpiCard({ icon: Icon, label, value, accent = OR, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: `${accent}18`,
      }}>
        <Icon size={18} color={accent} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 900, color: '#111827', lineHeight: 1, marginTop: 4 }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#6b7280', marginTop: -2 }}>{sub}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Status Badge
══════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════
   Order Card (gestion commandes)
══════════════════════════════════════════════════════════ */
function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { mutate: changeStatus, isPending: changing } = useMutation({
    mutationFn: (status) => api.patch(`/orders/manage/${order.id}/`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
    },
  })

  const nextStatuses = STATUS_NEXT[order.status] || []

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'grid',
          gridTemplateColumns: '56px 1fr auto',
          alignItems: 'center', gap: 12,
          padding: '14px 18px', cursor: 'pointer',
        }}
      >
        {/* ID */}
        <div style={{
          background: '#f3f4f6', borderRadius: 10,
          textAlign: 'center', padding: '6px 4px',
        }}>
          <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>CMD</p>
          <p style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>#{order.id}</p>
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {order.user?.first_name || order.user?.username || 'Client'}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {order.delivery_address?.substring(0, 40) || '—'}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Total + expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: OR }}>
            {FCFA(order.total_amount)} F
          </p>
          {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
        </div>
      </div>

      {/* Détail */}
      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px' }}>

          {/* Articles */}
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Articles
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#374151' }}>
                  {item.product_name} × {item.quantity}
                </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {FCFA(item.subtotal)} F
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 6, borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
              <span style={{ color: '#6b7280' }}>Livraison</span>
              <span style={{ color: '#6b7280' }}>{FCFA(order.delivery_fee)} F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#111827' }}>
              <span>Total</span>
              <span style={{ color: OR }}>{FCFA(order.total_amount)} F</span>
            </div>
          </div>

          {/* Paiement */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14,
            background: '#f9fafb', borderRadius: 10, padding: '10px 12px',
          }}>
            <CreditCard size={14} color="#6b7280" />
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
              {METHOD_LABELS[order.payment_method] || order.payment_method}
            </span>
            {order.payment_reference && (
              <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginLeft: 4 }}>
                {order.payment_reference}
              </span>
            )}
          </div>

          {/* Actions statut */}
          {nextStatuses.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Changer le statut
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {nextStatuses.map(ns => {
                  const cfg = STATUS_CFG[ns]
                  const isCancel = ns === 'cancelled'
                  return (
                    <button
                      key={ns}
                      onClick={() => changeStatus(ns)}
                      disabled={changing}
                      style={{
                        padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                        cursor: changing ? 'not-allowed' : 'pointer',
                        border: isCancel ? '1px solid #fecaca' : 'none',
                        background: isCancel ? '#fff' : cfg.dot,
                        color: isCancel ? '#dc2626' : '#fff',
                        opacity: changing ? 0.6 : 1,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      {ns === 'paid'       && <CheckCircle size={13} />}
                      {ns === 'processing' && <Clock size={13} />}
                      {ns === 'shipped'    && <Truck size={13} />}
                      {ns === 'delivered'  && <Star size={13} />}
                      {ns === 'cancelled'  && <XCircle size={13} />}
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {order.status === 'delivered' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
              background: '#dcfce7', borderRadius: 10, padding: '8px 12px' }}>
              <CheckCircle size={14} color="#15803d" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                Commande livrée — points fidélité crédités
              </span>
            </div>
          )}
          {order.status === 'cancelled' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
              background: '#fee2e2', borderRadius: 10, padding: '8px 12px' }}>
              <XCircle size={14} color="#dc2626" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>Commande annulée</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Onglet Commandes
══════════════════════════════════════════════════════════ */
const ORDER_FILTERS = [
  { value: '',           label: 'Toutes' },
  { value: 'pending',    label: 'En attente' },
  { value: 'paid',       label: 'Payées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped',    label: 'Expédiées' },
  { value: 'delivered',  label: 'Livrées' },
  { value: 'cancelled',  label: 'Annulées' },
]

function OrdersTab() {
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () => fetchOrders(filter),
    refetchInterval: 60000,
  })

  const orders = Array.isArray(data) ? data : (data?.results || [])
  const filtered = search
    ? orders.filter(o =>
        String(o.id).includes(search) ||
        (o.user?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.user?.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.delivery_address || '').toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div>
      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {ORDER_FILTERS.map(f => {
          const active = filter === f.value
          const cfg = f.value ? STATUS_CFG[f.value] : null
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                border: active ? 'none' : '1px solid #e5e7eb',
                background: active ? (cfg?.dot || OR) : '#fff',
                color: active ? '#fff' : '#6b7280',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par n°, client, adresse…"
          style={{
            width: '100%', padding: '10px 14px 10px 36px',
            border: '1px solid #e5e7eb', borderRadius: 10,
            fontSize: 13, outline: 'none', background: '#fff',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 72, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', opacity: 0.5 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <ShoppingCart size={36} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            {search ? 'Aucun résultat pour cette recherche.' : 'Aucune commande dans cette catégorie.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
            {filtered.length} commande{filtered.length > 1 ? 's' : ''}
          </p>
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Formulaire produit
══════════════════════════════════════════════════════════ */
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
  const [images, setImages]   = useState([])
  const [previews, setPreviews] = useState([])
  const [err, setErr]         = useState(null)
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

  const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '92vh', overflowY: 'auto', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isEdit && (
            <div>
              <label style={lbl}>Artisan *</label>
              <select style={inp} value={form.producer_id} onChange={e => set('producer_id', e.target.value)}>
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
            <input style={inp} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="ex. Panier tressé en raphia" />
          </div>

          <div>
            <label style={lbl}>Description *</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Décrivez le produit, ses matières, ses dimensions…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Prix (FCFA) *</label>
              <input style={inp} type="number" min="0" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label style={lbl}>Stock *</label>
              <input style={inp} type="number" min="0" value={form.stock}
                onChange={e => set('stock', e.target.value)} placeholder="10" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Localisation</label>
              <input style={inp} value={form.location}
                onChange={e => set('location', e.target.value)} placeholder="Maroua" />
            </div>
            <div>
              <label style={lbl}>Catégorie</label>
              <select style={inp} value={form.category} onChange={e => set('category', e.target.value)}>
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
                border: '2px dashed #d1d5db', borderRadius: 12, padding: '18px 16px',
                textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
              }}
            >
              <Upload size={20} color="#9ca3af" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: 13, color: '#6b7280' }}>Cliquez ou glissez vos photos</p>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
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

        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #d1d5db',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            Annuler
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !form.name || !form.price || !form.stock || (!isEdit && !form.producer_id)}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
              background: isPending ? '#6fb38a' : OR, color: '#fff',
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

/* ══════════════════════════════════════════════════════════
   Onglet Produits
══════════════════════════════════════════════════════════ */
function ProductsTab({ categories, producers }) {
  const qc = useQueryClient()
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [page, setPage]               = useState(1)
  const [showForm, setShowForm]       = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [confirmDelete, setConfirmDel] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, debouncedSearch],
    queryFn: () => fetchProducts(page, debouncedSearch),
  })

  const products = data?.results || (Array.isArray(data) ? data : [])
  const total    = data?.count || products.length

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, is_available }) => api.patch(`/products/${id}/`, { is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: id => api.delete(`/products/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
      setConfirmDel(null)
    },
  })

  const handleSearch = e => {
    setSearch(e.target.value)
    clearTimeout(window._st)
    window._st = setTimeout(() => { setDebounced(e.target.value); setPage(1) }, 400)
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%' }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>
              Supprimer ce produit ?
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              « {confirmDelete.name} » sera définitivement supprimé.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDel(null)} style={{
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search} onChange={handleSearch}
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
            background: OR, color: '#fff', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={14} /> Ajouter un produit
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 80px 70px 120px 72px',
            padding: '11px 18px', borderBottom: '1px solid #f3f4f6',
            fontSize: 11, fontWeight: 700, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Produit</span>
            <span>Artisan</span>
            <span style={{ textAlign: 'right' }}>Prix</span>
            <span style={{ textAlign: 'right' }}>Stock</span>
            <span style={{ textAlign: 'center' }}>Disponibilité</span>
            <span />
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Aucun produit trouvé.
            </div>
          ) : products.map((p, i) => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 80px 70px 120px 72px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < products.length - 1 ? '1px solid #f9fafb' : 'none',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.name}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{p.producer_name || '—'}</p>
              <p style={{ fontSize: 13, color: '#374151', textAlign: 'right', fontWeight: 600 }}>
                {FCFA(p.price)} F
              </p>
              <p style={{ fontSize: 13, color: p.stock <= 3 ? '#dc2626' : '#374151', textAlign: 'right', fontWeight: p.stock <= 3 ? 700 : 400 }}>
                {p.stock}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => toggle({ id: p.id, is_available: !p.is_available })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  {p.is_available
                    ? <ToggleRight size={22} color="#16a34a" />
                    : <ToggleLeft size={22} color="#d1d5db" />}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: p.is_available ? '#15803d' : '#9ca3af',
                  }}>
                    {p.is_available ? 'Actif' : 'Inactif'}
                  </span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditTarget(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                    background: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Pencil size={13} color="#6b7280" />
                </button>
                <button
                  onClick={() => setConfirmDel(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2',
                    background: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer',
              color: page === 1 ? '#d1d5db' : '#374151',
            }}
          >← Précédent</button>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Page {page} · {total} produits</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={products.length < 20}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13,
              cursor: products.length < 20 ? 'not-allowed' : 'pointer',
              color: products.length < 20 ? '#d1d5db' : '#374151',
            }}
          >Suivant →</button>
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   Onglet Artisans
══════════════════════════════════════════════════════════ */
function ProducersTab({ producers, isLoading }) {
  const [search, setSearch] = useState('')

  if (isLoading) return <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>

  const list = (Array.isArray(producers) ? producers : (producers?.results || []))
    .filter(p =>
      !search ||
      (p.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un artisan…"
          style={{
            width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #e5e7eb',
            borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 90px 110px',
          padding: '11px 18px', borderBottom: '1px solid #f3f4f6',
          fontSize: 11, fontWeight: 700, color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Artisan</span>
          <span>Ville</span>
          <span style={{ textAlign: 'center' }}>Statut</span>
          <span style={{ textAlign: 'right' }}>Inscription</span>
        </div>

        {list.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            {search ? 'Aucun résultat.' : 'Aucun artisan enregistré.'}
          </div>
        ) : list.map((p, i) => {
          const name = p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : p.username
          return (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 90px 110px',
              padding: '13px 18px', alignItems: 'center',
              borderBottom: i < list.length - 1 ? '1px solid #f9fafb' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: '#eff8f3', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: OR, fontSize: 15,
                }}>
                  {name[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{p.email}</p>
                </div>
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
          )
        })}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   Onglet Validations
══════════════════════════════════════════════════════════ */
function ValidationTab() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['producers-pending'],
    queryFn: fetchPending,
    refetchInterval: 30000,
  })
  const pending = Array.isArray(data) ? data : []

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, action }) => api.patch(`/auth/producers/${id}/validate/`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['producers-pending'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'global'] })
      qc.invalidateQueries({ queryKey: ['producers'] })
    },
  })

  if (isLoading) return <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>

  if (pending.length === 0) return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '56px 24px', textAlign: 'center',
    }}>
      <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 14px' }} />
      <p style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 6 }}>
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
        background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12,
        padding: '12px 16px', fontSize: 13, color: '#92400e', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <AlertTriangle size={16} color="#d97706" />
        {pending.length} compte{pending.length > 1 ? 's' : ''} artisan{pending.length > 1 ? 's' : ''} en attente de validation
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {pending.map((p, i) => {
          const name = p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : p.username
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              borderBottom: i < pending.length - 1 ? '1px solid #f3f4f6' : 'none',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, background: '#eff8f3', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: OR, fontSize: 20, border: `2px solid #86c9a0`,
              }}>
                {name[0]?.toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{p.email}</p>
                {p.phone && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{p.phone}</p>}
              </div>

              <p style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                {new Date(p.date_joined).toLocaleDateString('fr-FR')}
              </p>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => mutate({ id: p.id, action: 'approve' })}
                  disabled={isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 9, border: 'none',
                    background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={14} /> Approuver
                </button>
                <button
                  onClick={() => mutate({ id: p.id, action: 'reject' })}
                  disabled={isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 9,
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

/* ══════════════════════════════════════════════════════════
   Aperçu (Overview)
══════════════════════════════════════════════════════════ */
function OverviewTab({ stats, pendingCount, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Alerte validations */}
      {pendingCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '1px solid #fcd34d', borderRadius: 14,
          padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: '#d97706',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#78350f', marginBottom: 2 }}>
              {pendingCount} artisan{pendingCount > 1 ? 's' : ''} en attente de validation
            </p>
            <p style={{ fontSize: 12, color: '#92400e' }}>
              Leur boutique est inactive jusqu'à votre approbation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('validations')}
            style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: '#d97706', color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            Valider →
          </button>
        </div>
      )}

      {/* Raccourcis rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          {
            icon: ShoppingCart, label: 'Commandes en attente', value: stats?.pending_orders ?? '—',
            color: '#d97706', bg: '#fef3c7', action: () => onNavigate('orders'),
            hint: 'Voir les commandes',
          },
          {
            icon: Store, label: 'Artisans actifs', value: stats?.total_producers ?? '—',
            color: '#7c3aed', bg: '#ede9fe', action: () => onNavigate('producers'),
            hint: 'Gérer les artisans',
          },
          {
            icon: Package, label: 'Produits en ligne', value: stats?.total_products ?? '—',
            color: OR, bg: '#eff8f3', action: () => onNavigate('products'),
            hint: 'Gérer les produits',
          },
          {
            icon: Users, label: 'Clients inscrits', value: stats?.active_clients ?? '—',
            color: '#2563eb', bg: '#dbeafe', action: null, hint: null,
          },
        ].map(card => (
          <div
            key={card.label}
            onClick={card.action || undefined}
            style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
              padding: '18px 20px', cursor: card.action ? 'pointer' : 'default',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { if (card.action) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
            }}>
              <card.icon size={20} color={card.color} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 4 }}>
              {card.value}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{card.label}</p>
            {card.hint && (
              <p style={{ fontSize: 11, color: card.color, fontWeight: 700, marginTop: 6 }}>
                {card.hint} →
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Revenus */}
      <div style={{
        background: 'linear-gradient(135deg, #2D6A4F, #1a4431)',
        borderRadius: 16, padding: '24px 28px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Ventes totales (livré)
          </p>
          <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {stats?.total_sales ? `${FCFA(stats.total_sales)} F` : '—'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Ventes ce mois
          </p>
          <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {stats?.monthly_sales ? `${FCFA(stats.monthly_sales)} F` : '—'}
          </p>
        </div>
      </div>

      {/* Info commandes totales */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={18} color={OR} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Total des commandes</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>
          {stats?.total_orders ?? '—'}
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn: fetchGlobal,
    refetchInterval: 120000,
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

  const catList  = categories?.results || (Array.isArray(categories) ? categories : [])
  const prodList = Array.isArray(producers) ? producers : (producers?.results || [])

  const SIDEBAR_W = 220

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0, background: OR2,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#86c9a0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Administration
          </p>
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Sahel Market
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = tab === id
            const hasBadge = id === 'validations' && pendingCount > 0
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  marginBottom: 4, textAlign: 'left', position: 'relative',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: 3, background: '#86c9a0',
                  }} />
                )}
                <Icon size={16} />
                {label}
                {hasBadge && (
                  <span style={{
                    marginLeft: 'auto', background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bas de sidebar — stats rapides */}
        <div style={{ padding: '16px 20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Résumé
          </p>
          {[
            { label: 'Commandes en attente', value: stats?.pending_orders ?? '—', color: '#fbbf24' },
            { label: 'Produits',             value: stats?.total_products ?? '—', color: '#86c9a0' },
            { label: 'Artisans',             value: stats?.total_producers ?? '—', color: '#c4b5fd' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>

        {/* Header page */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              {NAV.find(n => n.id === tab)?.label || 'Aperçu'}
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {tab === 'overview' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Plateforme en ligne</span>
            </div>
          )}
        </div>

        {/* Corps */}
        <div style={{ padding: '28px', maxWidth: 1100 }}>
          {tab === 'overview' && (
            <OverviewTab stats={stats} pendingCount={pendingCount} onNavigate={setTab} />
          )}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'products' && (
            <ProductsTab categories={catList} producers={prodList} />
          )}
          {tab === 'producers' && (
            <ProducersTab producers={prodList} isLoading={loadingProducers} />
          )}
          {tab === 'validations' && <ValidationTab />}
        </div>
      </main>
    </div>
  )
}
