import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { orderService } from '../services/order.service.js'
import DeliveryTracker from '../components/DeliveryTracker.jsx'

const OR  = '#f97316'
const BG  = '#f0f2f5'
const FCFA = n => Number(n).toLocaleString('fr-FR')

const STATUS = {
  pending:    { label: 'En attente',    bg: '#fef9c3', color: '#92400e' },
  paid:       { label: 'Payé',          bg: '#dbeafe', color: '#1e40af' },
  processing: { label: 'En traitement', bg: '#ede9fe', color: '#5b21b6' },
  shipped:    { label: 'Expédié',       bg: '#ffedd5', color: '#c2410c' },
  delivered:  { label: 'Livré',         bg: '#dcfce7', color: '#15803d' },
  cancelled:  { label: 'Annulé',        bg: '#fee2e2', color: '#dc2626' },
}

export default function TrackOrder() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getOrder(id),
  })
  const order = data?.data

  const s = STATUS[order?.status] || STATUS.pending

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      <div style={{ background: '#1a1a1a', padding: '20px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
          <Link to="/orders" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', marginBottom: 12,
          }}>
            <ArrowLeft size={14} /> Mes commandes
          </Link>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Suivi de livraison
          </p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Commande #{id}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {isLoading ? (
          <div style={{ background: '#fff', borderRadius: 16, height: 120, border: '1px solid #e5e7eb', opacity: 0.5 }} />
        ) : order ? (
          <>
            {/* Résumé commande */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Récapitulatif</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                  background: s.bg, color: s.color,
                }}>{s.label}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9ca3af' }}>Total</span>
                  <span style={{ fontWeight: 700, color: OR }}>{FCFA(order.total_amount)} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9ca3af' }}>Référence paiement</span>
                  <span style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                    {order.payment_reference || '—'}
                  </span>
                </div>
                <div style={{ fontSize: 13, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#9ca3af' }}>Adresse : </span>
                  <span style={{ color: '#374151' }}>{order.delivery_address}</span>
                </div>
              </div>
            </div>

            {/* Tracker WebSocket */}
            {order.status === 'shipped' ? (
              <DeliveryTracker orderId={id} />
            ) : (
              <div style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
                padding: '32px 24px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: '#9ca3af' }}>
                  Le suivi GPS en temps réel sera disponible dès que votre commande sera en cours de livraison.
                </p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
                  Statut actuel : <strong style={{ color: s.color }}>{s.label}</strong>
                </p>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14,
          }}>
            Commande introuvable.
          </div>
        )}
      </div>
    </div>
  )
}
