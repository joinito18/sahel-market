import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Package, MapPin, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { orderService } from '../services/order.service.js'
import { addItem, openCart } from '../store/cartSlice.js'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const OR = '#f97316'
const BG = '#f0f2f5'

const STATUS = {
  pending:    { label: 'En attente',    bg: '#fef9c3', color: '#92400e' },
  paid:       { label: 'Payé',          bg: '#dbeafe', color: '#1e40af' },
  processing: { label: 'En traitement', bg: '#ede9fe', color: '#5b21b6' },
  shipped:    { label: 'Expédié',       bg: '#ffedd5', color: '#c2410c' },
  delivered:  { label: 'Livré',         bg: '#dcfce7', color: '#15803d' },
  cancelled:  { label: 'Annulé',        bg: '#fee2e2', color: '#dc2626' },
}

const METHOD_LABELS = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', cash: 'Espèces' }

/* Étapes de suivi */
const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered']
const STEP_LABELS = {
  pending:    'Commande placée',
  paid:       'Paiement confirmé',
  processing: 'En préparation',
  shipped:    'En livraison',
  delivered:  'Livré',
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const s = STATUS[order.status] || STATUS.pending
  const currentStep = STEPS.indexOf(order.status)

  function handleReorder(e) {
    e.stopPropagation()
    order.items.forEach(item => {
      if (!item.product_id) return
      for (let i = 0; i < item.quantity; i++) {
        dispatch(addItem({
          id:         item.product_id,
          name:       item.product_name,
          price:      parseFloat(item.unit_price),
          main_image: item.main_image || null,
        }))
      }
    })
    dispatch(openCart())
    toast.success('Articles ajoutés au panier !')
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      {/* En-tête */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
              Commande #{order.id}
            </p>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: s.bg, color: s.color,
            }}>{s.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <MapPin size={11} color="#9ca3af" />
            <p style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
              {order.delivery_address}
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
            {Number(order.total_amount).toLocaleString('fr-FR')} F
          </p>
          {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
        </div>
      </button>

      {/* Détail */}
      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '20px' }}>

          {/* Barre de progression */}
          {order.status !== 'cancelled' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                {STEPS.map((step, i) => {
                  const done = i <= currentStep
                  const last = i === STEPS.length - 1
                  return (
                    <div key={step} style={{ flex: last ? 0 : 1, display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === STEPS.length - 1 ? 'flex-end' : 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: done ? OR : '#e5e7eb',
                          border: `3px solid ${done ? OR : '#e5e7eb'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {done && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        {!last && (
                          <div style={{ flex: 1, height: 3, background: i < currentStep ? OR : '#e5e7eb' }} />
                        )}
                      </div>
                      <p style={{
                        fontSize: 10, marginTop: 5, fontWeight: done ? 700 : 400,
                        color: done ? OR : '#9ca3af',
                        maxWidth: 60, textAlign: 'center',
                        textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center',
                      }}>
                        {STEP_LABELS[step]}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Paiement */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14,
          }}>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>PAIEMENT</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {METHOD_LABELS[order.payment_method] || '—'}
              </p>
              {order.payment_reference && (
                <p style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>
                  {order.payment_reference}
                </p>
              )}
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>LIVRAISON</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {Number(order.delivery_fee).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Articles */}
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>ARTICLES</p>
            {order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #f3f4f6',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.product_name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    {item.quantity} × {Number(item.unit_price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                  {Number(item.subtotal).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>Total</p>
              <p style={{ fontWeight: 800, color: OR, fontSize: 14 }}>
                {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Bouton commander à nouveau */}
          <button
            onClick={handleReorder}
            style={{
              marginTop: 14, width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7, padding: '11px 0',
              background: OR, color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.01em',
            }}
          >
            <RotateCcw size={14} />
            Commander à nouveau
          </button>
        </div>
      )}
    </div>
  )
}

export default function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
  })

  const orders = data?.data?.results || data?.data || []

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      <div style={{ background: '#1a1a1a', padding: '40px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Mon compte
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Mes commandes
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, height: 88,
                border: '1px solid #e5e7eb', opacity: 0.6,
              }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '64px 24px', textAlign: 'center',
          }}>
            <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} strokeWidth={1} />
            <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 16 }}>
              Aucune commande pour l'instant
            </p>
            <Link to="/products" style={{
              display: 'inline-block', padding: '10px 24px', background: OR,
              color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}>
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  )
}
