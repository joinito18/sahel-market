import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, Package, Truck, MapPin, CreditCard, Star } from 'lucide-react'
import { orderService } from '../services/order.service.js'

const OR  = '#f97316'
const BG  = '#f0f2f5'
const FCFA = n => Number(n).toLocaleString('fr-FR')

const STEPS = [
  { key: 'pending',    icon: Clock,      label: 'Commande passée',     desc: 'Votre commande a bien été enregistrée.' },
  { key: 'paid',       icon: CreditCard, label: 'Paiement confirmé',   desc: 'Votre paiement a été validé.' },
  { key: 'processing', icon: Package,    label: 'En préparation',      desc: "L'artisan prépare votre commande." },
  { key: 'shipped',    icon: Truck,      label: 'En livraison',        desc: 'Votre commande est en route !' },
  { key: 'delivered',  icon: Star,       label: 'Livrée',              desc: 'Commande reçue. Merci !' },
]

const STEP_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered']

function stepIndex(status) {
  const idx = STEP_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx
}

export default function TrackOrder() {
  const { id } = useParams()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getOrder(id),
    refetchInterval: 30000,
  })
  const order = data?.data

  const currentIdx = order?.status === 'cancelled' ? -1 : stepIndex(order?.status || 'pending')

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '24px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
          <Link to="/orders" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', marginBottom: 14,
          }}>
            <ArrowLeft size={14} /> Mes commandes
          </Link>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Suivi de livraison
          </p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(18px,5vw,26px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Commande #{id}
          </h1>
          {order && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {isLoading ? (
          <div style={{ background: '#fff', borderRadius: 16, height: 260, border: '1px solid #e5e7eb', opacity: 0.5 }} />
        ) : !order ? (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14,
          }}>
            Commande introuvable.
          </div>
        ) : (
          <>
            {/* ── Timeline ───────────────────────────────────────── */}
            {order.status === 'cancelled' ? (
              <div style={{
                background: '#fff', borderRadius: 16, border: '1px solid #fecaca',
                padding: '24px 28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: '#fee2e2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 22 }}>✕</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: '#dc2626' }}>Commande annulée</p>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                      Contactez-nous si vous avez des questions.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 28 }}>
                  Progression de votre commande
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STEPS.map((step, i) => {
                    const StepIcon = step.icon
                    const isDone    = i < currentIdx
                    const isCurrent = i === currentIdx
                    const isFuture  = i > currentIdx
                    const isLast    = i === STEPS.length - 1

                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 16 }}>
                        {/* Colonne gauche : cercle + trait */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <motion.div
                            initial={isCurrent ? { scale: 0.8 } : false}
                            animate={isCurrent ? { scale: [0.8, 1.05, 1] } : false}
                            transition={{ duration: 0.4 }}
                            style={{
                              width: 40, height: 40, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isDone ? '#f0fdf4' : isCurrent ? '#fff7ed' : '#f9fafb',
                              border: `2px solid ${isDone ? '#16a34a' : isCurrent ? OR : '#e5e7eb'}`,
                              transition: 'all .3s',
                            }}
                          >
                            {isDone ? (
                              <Check size={18} color="#16a34a" strokeWidth={3} />
                            ) : (
                              <StepIcon size={17} color={isCurrent ? OR : '#d1d5db'} />
                            )}
                          </motion.div>
                          {!isLast && (
                            <div style={{
                              width: 2, flex: 1, minHeight: 28,
                              background: isDone
                                ? 'linear-gradient(to bottom, #16a34a, #16a34a)'
                                : '#e5e7eb',
                              margin: '4px 0',
                              transition: 'background .3s',
                            }} />
                          )}
                        </div>

                        {/* Colonne droite : texte */}
                        <div style={{ paddingBottom: isLast ? 0 : 28, paddingTop: 6 }}>
                          <p style={{
                            fontSize: 14, fontWeight: isCurrent ? 800 : isDone ? 600 : 500,
                            color: isDone ? '#15803d' : isCurrent ? '#111827' : '#9ca3af',
                            marginBottom: (isCurrent || isDone) ? 2 : 0,
                          }}>
                            {step.label}
                            {isCurrent && (
                              <span style={{
                                marginLeft: 8, fontSize: 10, fontWeight: 700,
                                background: '#fff7ed', color: OR, border: `1px solid #fed7aa`,
                                borderRadius: 10, padding: '2px 8px',
                              }}>
                                En cours
                              </span>
                            )}
                          </p>
                          {(isCurrent || isDone) && (
                            <p style={{ fontSize: 12, color: isDone ? '#6b7280' : '#9ca3af' }}>
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Récapitulatif commande ─────────────────────────── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>Détails de la commande</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Articles */}
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#374151' }}>
                      {item.product_name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>
                      {FCFA(item.unit_price * item.quantity)} FCFA
                    </span>
                  </div>
                ))}

                <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9ca3af' }}>Livraison</span>
                  <span style={{ color: '#374151' }}>
                    {order.delivery_fee > 0 ? `${FCFA(order.delivery_fee)} FCFA` : 'Gratuite'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>Total</span>
                  <span style={{ fontWeight: 800, color: OR }}>{FCFA(order.total_amount)} FCFA</span>
                </div>
              </div>
            </div>

            {/* ── Infos livraison ────────────────────────────────── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={15} color={OR} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 3 }}>Adresse de livraison</p>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{order.delivery_address}</p>
                </div>
              </div>
              {order.payment_reference && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    Référence paiement :{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#374151' }}>
                      {order.payment_reference}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* ── Besoin d'aide ──────────────────────────────────── */}
            <div style={{
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16,
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>Besoin d'aide ?</p>
                <p style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                  Notre équipe répond sous 24h.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="mailto:sahelmarket@gmail.com" style={{
                  padding: '8px 14px', background: OR, color: '#fff', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: 12,
                }}>
                  Email
                </a>
                <a href="https://wa.me/237680757871" target="_blank" rel="noopener noreferrer" style={{
                  padding: '8px 14px', background: '#16a34a', color: '#fff', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: 12,
                }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
