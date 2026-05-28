import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ShoppingBag, Users, Plus, ChevronDown, ChevronUp,
  Phone, AlertCircle, X, CheckCircle,
} from 'lucide-react'
import api from '../../services/api.js'

const OR = '#2D6A4F'
const BG = '#f0f2f5'

const STATUS = {
  pending:    { label: 'En attente',    bg: '#fef9c3', color: '#92400e' },
  paid:       { label: 'Payé',          bg: '#dbeafe', color: '#1e40af' },
  processing: { label: 'En traitement', bg: '#ede9fe', color: '#5b21b6' },
  shipped:    { label: 'Expédié',       bg: '#d6eddf', color: '#194328' },
  delivered:  { label: 'Livré',         bg: '#dcfce7', color: '#15803d' },
  cancelled:  { label: 'Annulé',        bg: '#fee2e2', color: '#dc2626' },
}

const NEXT_STATUS = {
  pending:    'paid',
  paid:       'processing',
  processing: 'shipped',
  shipped:    'delivered',
}

const NEXT_LABEL = {
  pending:    'Marquer Payé',
  paid:       'Mettre en traitement',
  processing: 'Marquer Expédié',
  shipped:    'Confirmer livraison',
}

const STATUS_FILTERS = [
  { id: '', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'paid', label: 'Payées' },
  { id: 'processing', label: 'En traitement' },
  { id: 'shipped', label: 'Expédiées' },
  { id: 'delivered', label: 'Livrées' },
]

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  )
}

/* ─── Carte commande ─── */
function OrderCard({ order }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutate: advance, isPending } = useMutation({
    mutationFn: (newStatus) => api.patch(`/orders/manage/${order.id}/`, { status: newStatus }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-orders'] }),
  })

  const nextStatus = NEXT_STATUS[order.status]
  const METHOD_LABELS = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', cash: 'Espèces' }

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                Commande #{order.id}
              </p>
              <StatusBadge status={order.status} />
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              {format(new Date(order.created_at), 'dd MMM yyyy · HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
            {Number(order.total_amount).toLocaleString('fr-FR')} F
          </p>

          {nextStatus && (
            <button
              onClick={() => advance(nextStatus)}
              disabled={isPending}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: OR, color: '#fff', fontWeight: 700,
                fontSize: 12, cursor: 'pointer', flexShrink: 0,
              }}
            >
              {isPending ? '…' : NEXT_LABEL[order.status]}
            </button>
          )}
          {order.status === 'delivered' && (
            <CheckCircle size={18} color="#16a34a" />
          )}

          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
          </button>
        </div>
      </div>

      {/* Détail dépliable */}
      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Infos client */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>CLIENT</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{order.client_name || '—'}</p>
              {order.client_phone && (
                <a href={`tel:${order.client_phone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: OR, marginTop: 4, textDecoration: 'none' }}>
                  <Phone size={11} /> {order.client_phone}
                </a>
              )}
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>PAIEMENT</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {METHOD_LABELS[order.payment_method] || '—'}
              </p>
              {order.payment_phone && (
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{order.payment_phone}</p>
              )}
              {order.payment_reference && (
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontFamily: 'monospace' }}>
                  {order.payment_reference}
                </p>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>ADRESSE DE LIVRAISON</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{order.delivery_address}</p>
          </div>

          {/* Articles */}
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>ARTICLES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #f3f4f6',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.product_name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>
                      {item.quantity} × {Number(item.unit_price).toLocaleString('fr-FR')} F
                    </p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                    {Number(item.subtotal).toLocaleString('fr-FR')} F
                  </p>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <p style={{ fontSize: 12, color: '#6b7280' }}>Livraison</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{Number(order.delivery_fee).toLocaleString('fr-FR')} F</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f3f4f6', paddingTop: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: OR }}>{Number(order.total_amount).toLocaleString('fr-FR')} F</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Onglet Commandes ─── */
function OrdersTab() {
  const [filter, setFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['agent-orders', filter],
    queryFn: () => api.get('/orders/manage/', { params: filter ? { status: filter } : {} }).then(r => r.data),
  })

  const orders = Array.isArray(data) ? data : []

  return (
    <div>
      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: filter === f.id ? OR : '#fff',
              color: filter === f.id ? '#fff' : '#6b7280',
              border: `1px solid ${filter === f.id ? OR : '#e5e7eb'}`,
            }}
          >
            {f.label}
            {f.id === '' && orders.length > 0 && filter === '' && (
              <span style={{
                marginLeft: 6, background: 'rgba(255,255,255,0.25)',
                borderRadius: 10, padding: '1px 6px', fontSize: 10,
              }}>{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Chargement…</div>
      ) : orders.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <ShoppingBag size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Aucune commande dans ce statut.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  )
}

/* ─── Onglet Artisans ─── */
function ProducersTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '' })
  const [err, setErr] = useState(null)
  const [newPassword, setNewPassword] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['agent-producers'],
    queryFn: () => api.get('/agents/producers/').then(r => r.data),
  })
  const producers = Array.isArray(data) ? data : (data?.results || [])

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/agents/producers/', {
      nom: form.last_name,
      prenom: form.first_name,
      email: form.email,
      telephone: form.phone,
      adresse: form.address,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['agent-producers'] })
      setNewPassword(res.data.temporary_password)
      setForm({ first_name: '', last_name: '', email: '', phone: '', address: '' })
      setShowForm(false)
    },
    onError: e => setErr(e.response?.data ? JSON.stringify(e.response.data) : 'Erreur réseau'),
  })

  const input = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Mot de passe temporaire */}
      {newPassword && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
          padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <p style={{ fontWeight: 700, color: '#15803d', fontSize: 14, marginBottom: 4 }}>
              Artisan créé avec succès !
            </p>
            <p style={{ fontSize: 13, color: '#166534' }}>
              Mot de passe temporaire à transmettre :
              <span style={{ fontFamily: 'monospace', fontWeight: 800, marginLeft: 8, fontSize: 15 }}>
                {newPassword}
              </span>
            </p>
          </div>
          <button onClick={() => setNewPassword(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color="#15803d" />
          </button>
        </div>
      )}

      {/* Bouton ajouter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: OR, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Ajouter un artisan
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>
            Nouvel artisan
          </p>
          {err && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#dc2626',
              display: 'flex', gap: 8,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Prénom *</label>
              <input style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Nom *</label>
              <input style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input style={input} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Téléphone</label>
              <input style={input} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>Adresse</label>
              <input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Maroua, Cameroun" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={() => setShowForm(false)} style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #d1d5db',
              background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Annuler</button>
            <button
              onClick={() => mutate()}
              disabled={isPending || !form.first_name || !form.email}
              style={{
                flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                background: isPending ? '#fdba74' : OR, color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {isPending ? 'Création…' : 'Créer le compte artisan'}
            </button>
          </div>
        </div>
      )}

      {/* Liste artisans */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color={OR} />
          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
            Mes artisans ({producers.length})
          </p>
        </div>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Chargement…</div>
        ) : producers.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Aucun artisan enregistré. Ajoutez-en un avec le bouton ci-dessus.
          </div>
        ) : producers.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < producers.length - 1 ? '1px solid #f9fafb' : 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: '#eff8f3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: OR, fontSize: 15, flexShrink: 0,
            }}>
              {(p.first_name || p.username || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {p.first_name} {p.last_name}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
                {p.email}{p.phone ? ` · ${p.phone}` : ''}
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: '#dcfce7', color: '#15803d',
            }}>Actif</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Composant principal ─── */
export default function AgentDashboard() {
  const [tab, setTab] = useState('orders')

  const { data: ordersData } = useQuery({
    queryKey: ['agent-orders', ''],
    queryFn: () => api.get('/orders/manage/').then(r => r.data),
  })
  const allOrders = Array.isArray(ordersData) ? ordersData : []
  const pendingCount = allOrders.filter(o => o.status === 'pending').length

  const tabs = [
    {
      id: 'orders',
      label: 'Commandes',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { id: 'producers', label: 'Artisans' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '36px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Espace agent
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Tableau de bord
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            Gérez les commandes et accompagnez les artisans.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Tabs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: tab === t.id ? OR : 'transparent',
                  color: tab === t.id ? '#fff' : '#6b7280',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t.label}
                {t.badge && (
                  <span style={{
                    background: tab === t.id ? 'rgba(255,255,255,0.3)' : '#dc2626',
                    color: '#fff', borderRadius: 10, padding: '0 6px',
                    fontSize: 11, fontWeight: 800, lineHeight: '18px',
                  }}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === 'orders'    && <OrdersTab />}
        {tab === 'producers' && <ProducersTab />}
      </div>
    </div>
  )
}
