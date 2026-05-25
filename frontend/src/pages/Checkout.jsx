import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Smartphone, ChevronRight, ArrowLeft,
  ShoppingBag, Check, Copy, Phone, Clock, Package, Gift, Star, Tag, X,
  Loader2, AlertTriangle,
} from 'lucide-react'
import { orderService } from '../services/order.service.js'
import { clearCart } from '../store/cartSlice.js'
import { imgUrl, fcfa } from '../utils/media.js'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  {
    id:    'orange_money',
    label: 'Orange Money',
    color: '#f97316',
    bg:    '#fff7ed',
    border:'#fed7aa',
    icon:  '🟠',
    desc:  'Paiement instantané via votre compte Orange',
  },
  {
    id:    'mtn_momo',
    label: 'MTN Mobile Money',
    color: '#d97706',
    bg:    '#fffbeb',
    border:'#fde68a',
    icon:  '🟡',
    desc:  'Paiement instantané via votre compte MTN MoMo',
  },
  {
    id:    'cash',
    label: 'Espèces à la livraison',
    color: '#16a34a',
    bg:    '#f0fdf4',
    border:'#bbf7d0',
    icon:  '💵',
    desc:  'Payez en cash à la réception de votre commande',
  },
]

const DELIVERY_FEES = [
  { label: 'Maroua & Extrême-Nord',    fee: 500  },
  { label: 'Garoua / Ngaoundéré',      fee: 1500 },
  { label: 'Yaoundé / Douala',         fee: 2500 },
  { label: 'Autres régions',           fee: 3500 },
]

/* ── Attente de paiement Campay (USSD push) ──────────────────── */
function PaymentWaiting({ order, paymentMethod, onPaid, onTimeout }) {
  const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod)
  const [elapsed, setElapsed] = useState(0)
  const [paid, setPaid] = useState(false)
  const TIMEOUT = 300 // 5 minutes

  useEffect(() => {
    const interval = setInterval(async () => {
      setElapsed(e => e + 4)
      try {
        const res = await orderService.getOrder(order.id)
        if (res.data?.status === 'paid') {
          clearInterval(interval)
          setPaid(true)
          setTimeout(onPaid, 1500)
        }
      } catch {}
    }, 4000)
    return () => clearInterval(interval)
  }, [order.id, onPaid])

  useEffect(() => {
    if (elapsed >= TIMEOUT) onTimeout()
  }, [elapsed, onTimeout])

  const remaining = Math.max(0, TIMEOUT - elapsed)
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}
    >
      {paid ? (
        <>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4',
              border: '3px solid #16a34a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
            }}>
            <Check size={36} color="#16a34a" strokeWidth={3} />
          </motion.div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>Paiement confirmé !</p>
        </>
      ) : (
        <>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: pm?.bg || '#fff7ed',
            border: `3px solid ${pm?.border || '#fed7aa'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Loader2 size={36} color={pm?.color || '#f97316'}
                     style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
            Vérifiez votre téléphone
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
            Une demande de paiement <strong>{pm?.label}</strong> a été envoyée sur le numéro{' '}
            <strong style={{ color: '#111827' }}>{order.payment_phone || 'enregistré'}</strong>.
            Confirmez sur votre téléphone pour valider la commande.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '10px 20px', marginBottom: 24,
          }}>
            <Clock size={15} color="#9ca3af" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>
              {mins}:{secs}
            </span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>restantes</span>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            Vérification automatique toutes les 4 secondes…
          </p>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}

/* ── État de confirmation post-commande ──────────────────────── */
function Confirmation({ order, paymentMethod, instructions, loyaltyDiscount, promoDiscount }) {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod)

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px' }}
    >
      {/* Icône succès */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          style={{
            width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4',
            border: '3px solid #16a34a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}
        >
          <Check size={32} color="#16a34a" strokeWidth={3} />
        </motion.div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 6 }}>
          Commande confirmée !
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Référence : <strong style={{ color: '#f97316' }}>{order.payment_reference || `CMD-${order.id}`}</strong>
        </p>
        {loyaltyDiscount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '5px 14px',
          }}>
            <Gift size={13} color="#16a34a" />
            <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>
              {fcfa(loyaltyDiscount)} de réduction fidélité appliquée
            </span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 20, padding: '5px 14px',
          }}>
            <Tag size={13} color="#f97316" />
            <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 700 }}>
              {fcfa(promoDiscount)} de remise code promo
            </span>
          </div>
        )}
      </div>

      {/* Instructions paiement */}
      {instructions && paymentMethod !== 'cash' ? (
        <div style={{
          background: pm?.bg, border: `2px solid ${pm?.border}`,
          borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: pm?.color,
                       textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            {pm?.icon} Instructions de paiement — {pm?.label}
          </p>

          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>
            Envoyez <strong style={{ color: '#111827' }}>{fcfa(order.total_amount)}</strong> au numéro{' '}
            {pm?.label} de Sahel Market :
          </p>

          {/* Numéro */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            padding: '12px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 10,
          }}>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Numéro {pm?.label}</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '0.05em' }}>
                {instructions.numero}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{instructions.nom}</p>
            </div>
            <button
              onClick={() => copy(instructions.numero)}
              style={{
                padding: '8px 14px', background: pm?.color, color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Copy size={13} />
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>

          {/* Référence */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            padding: '10px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Référence à indiquer</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: '#f97316', letterSpacing: '0.05em' }}>
                {instructions.ref}
              </p>
            </div>
            <button
              onClick={() => copy(instructions.ref)}
              style={{
                padding: '6px 12px', background: 'transparent', color: pm?.color,
                border: `1px solid ${pm?.border}`, borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Copy size={13} /> Copier
            </button>
          </div>
        </div>
      ) : paymentMethod === 'cash' ? (
        <div style={{
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 14, color: '#15803d', lineHeight: 1.6 }}>
            💵 Vous paierez <strong>{fcfa(order.total_amount)}</strong> en espèces à la réception de votre commande.
            Prévoyez la monnaie exacte si possible.
          </p>
        </div>
      ) : null}

      {/* Infos agent */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Clock size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          Un agent Sahel Market vous contactera sous <strong>2 heures</strong> pour confirmer
          votre commande et organiser la livraison. Ayez votre téléphone à portée.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link to={`/orders`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', background: '#f97316', color: '#fff', borderRadius: 12,
            textDecoration: 'none', fontSize: 14, fontWeight: 700,
          }}>
          <ShoppingBag size={16} /> Suivre mes commandes
        </Link>
        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '12px', background: 'transparent', border: '2px solid #e5e7eb',
            borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#374151',
            cursor: 'pointer',
          }}
        >
          Continuer mes achats
        </button>
      </div>
    </motion.div>
  )
}

/* ── Page Checkout ───────────────────────────────────────────── */
export default function Checkout() {
  const { items, total } = useSelector(s => s.cart)
  const user             = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('orange_money')
  const [deliveryFee, setDeliveryFee]     = useState(1500)
  const [confirmed, setConfirmed]         = useState(null)
  const [applyLoyalty, setApplyLoyalty]   = useState(false)
  const [promoInput, setPromoInput]       = useState('')
  const [promoResult, setPromoResult]     = useState(null)
  const [promoLoading, setPromoLoading]   = useState(false)
  const [promoError, setPromoError]       = useState('')

  const loyaltyPts   = user?.loyalty_points || 0
  const loyaltyValue = Math.floor(loyaltyPts / 100) * 500

  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await orderService.validatePromo({
        code: promoInput.trim().toUpperCase(),
        cart_total: total,
      })
      setPromoResult(res.data)
      toast.success(`Code "${res.data.code}" appliqué !`)
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Code invalide')
      setPromoResult(null)
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromo = () => {
    setPromoResult(null)
    setPromoInput('')
    setPromoError('')
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  if (items.length === 0 && !confirmed) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <ShoppingBag size={48} color="#d1d5db" strokeWidth={1} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Votre panier est vide</p>
        <Link to="/products"
          style={{
            padding: '10px 24px', background: '#f97316', color: '#fff',
            borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700,
          }}>
          Voir le catalogue
        </Link>
      </div>
    )
  }

  if (confirmed) {
    const isMobilePay = ['orange_money', 'mtn_momo'].includes(paymentMethod)
    const useCampay   = confirmed.campayInitiated && isMobilePay

    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        {useCampay && !confirmed.campayDone ? (
          <PaymentWaiting
            order={confirmed.order}
            paymentMethod={paymentMethod}
            onPaid={() => setConfirmed(c => ({ ...c, campayDone: true }))}
            onTimeout={() => setConfirmed(c => ({ ...c, campayInitiated: false }))}
          />
        ) : (
          <Confirmation
            order={confirmed.order}
            paymentMethod={paymentMethod}
            instructions={confirmed.instructions}
            loyaltyDiscount={confirmed.loyaltyDiscount}
            promoDiscount={confirmed.promoDiscount || 0}
          />
        )}
      </div>
    )
  }

  const onSubmit = async (data) => {
    try {
      const res = await orderService.checkout({
        delivery_address: data.address,
        delivery_fee:     deliveryFee,
        payment_method:   paymentMethod,
        payment_phone:    data.payment_phone || '',
        apply_loyalty:    applyLoyalty && loyaltyValue > 0,
        promo_code:       promoResult?.code || '',
      })
      dispatch(clearCart())
      setConfirmed({
        order:           res.data.order,
        instructions:    res.data.instructions,
        loyaltyDiscount: res.data.loyalty_discount || 0,
        promoDiscount:   res.data.promo_discount   || 0,
        campayInitiated: res.data.campay_initiated  || false,
        campayDone:      false,
      })
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la commande'
      toast.error(msg)
    }
  }

  const loyaltyDiscount = applyLoyalty && loyaltyValue > 0 ? Math.min(loyaltyValue, total) : 0
  const promoDiscount = promoResult
    ? (promoResult.discount_type === 'free_delivery' ? deliveryFee : (promoResult.discount_amount || 0))
    : 0
  const effectiveDelivery = promoResult?.discount_type === 'free_delivery' ? 0 : deliveryFee
  const grandTotal = Math.max(0, total + effectiveDelivery - loyaltyDiscount - promoDiscount)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px',
                       display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
              border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', padding: 0,
              flexShrink: 0,
            }}>
            <ArrowLeft size={16} />
            <span className="checkout-steps-breadcrumb">Retour au panier</span>
          </button>
          <div className="checkout-steps-divider" style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
          <div className="checkout-steps-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {['Panier', 'Livraison', 'Confirmation'].map((s, i) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontWeight: i === 1 ? 700 : 400,
                  color: i === 1 ? '#f97316' : i < 1 ? '#16a34a' : '#9ca3af',
                }}>{s}</span>
                {i < 2 && <ChevronRight size={13} color="#d1d5db" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="checkout-layout-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* ── Colonne gauche : formulaire ─────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Adresse de livraison */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '24px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: '#fff7ed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPin size={18} color="#f97316" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Adresse de livraison</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Où souhaitez-vous être livré ?</p>
              </div>
            </div>

            {/* Zone de livraison */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                               color: '#374151', marginBottom: 8 }}>
                Zone de livraison
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {DELIVERY_FEES.map(({ label, fee }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDeliveryFee(fee)}
                    style={{
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${deliveryFee === fee ? '#f97316' : '#e5e7eb'}`,
                      background: deliveryFee === fee ? '#fff7ed' : '#fff',
                      transition: 'all .15s',
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600,
                                 color: deliveryFee === fee ? '#f97316' : '#374151' }}>{label}</p>
                    <p style={{ fontSize: 12, color: deliveryFee === fee ? '#f97316' : '#9ca3af',
                                 marginTop: 2 }}>
                      {fee === 0 ? 'Gratuit' : `${fee.toLocaleString('fr-FR')} FCFA`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Adresse précise */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                               color: '#374151', marginBottom: 8 }}>
                Adresse précise
              </label>
              <textarea
                {...register('address', { required: 'Adresse requise' })}
                rows={3}
                placeholder="Quartier, rue, point de repère, ville..."
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 13,
                  border: `1.5px solid ${errors.address ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: 10, outline: 'none', resize: 'none',
                  fontFamily: 'inherit', lineHeight: 1.5,
                  transition: 'border-color .15s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = errors.address ? '#ef4444' : '#e5e7eb'}
              />
              {errors.address && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Moyen de paiement */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: '#fff7ed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Smartphone size={18} color="#f97316" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Moyen de paiement</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Sélectionnez votre méthode préférée</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${paymentMethod === pm.id ? pm.color : '#e5e7eb'}`,
                    background: paymentMethod === pm.id ? pm.bg : '#fff',
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{pm.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700,
                                 color: paymentMethod === pm.id ? pm.color : '#111827' }}>
                      {pm.label}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{pm.desc}</p>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${paymentMethod === pm.id ? pm.color : '#d1d5db'}`,
                    background: paymentMethod === pm.id ? pm.color : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {paymentMethod === pm.id && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Numéro de paiement (si mobile money) */}
            {paymentMethod !== 'cash' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 16 }}
              >
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                 color: '#374151', marginBottom: 8 }}>
                  Votre numéro {paymentMethod === 'orange_money' ? 'Orange' : 'MTN'}{' '}
                  <span style={{ fontWeight: 400, color: '#9ca3af' }}>(facultatif)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                               border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', background: '#f9fafb', flexShrink: 0,
                                 display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#9ca3af" />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>+237</span>
                  </div>
                  <input
                    {...register('payment_phone')}
                    type="tel"
                    placeholder="6XX XXX XXX"
                    style={{
                      flex: 1, padding: '12px 14px', border: 'none', outline: 'none',
                      fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                  Permet à notre agent de vous envoyer une demande de paiement directement.
                </p>
              </motion.div>
            )}
          </div>
        </form>

        {/* ── Colonne droite : récapitulatif ─────────────────── */}
        <div className="checkout-sidebar-sticky">
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})
              </p>
            </div>

            {/* Liste articles */}
            <div style={{ padding: '12px 20px', maxHeight: 280, overflowY: 'auto' }}>
              {items.map(item => {
                const src = imgUrl(item.main_image)
                return (
                  <div key={item.id} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    paddingBottom: 12, marginBottom: 12,
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                      flexShrink: 0, background: '#f9fafb', border: '1px solid #f3f4f6',
                    }}>
                      {src
                        ? <img src={src} alt={item.name}
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex',
                                         alignItems: 'center', justifyContent: 'center',
                                         background: '#f9fafb' }}>
                            <Package size={20} color="#d1d5db" />
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827',
                                   overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        Qté {item.quantity}
                      </p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f97316', flexShrink: 0 }}>
                      {fcfa(item.price * item.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Champ code promo */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <AnimatePresence mode="wait">
                {promoResult ? (
                  <motion.div
                    key="promo-applied"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: 10, padding: '9px 12px',
                    }}
                  >
                    <Tag size={13} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                        {promoResult.code}
                      </p>
                      <p style={{ fontSize: 11, color: '#4ade80', marginTop: 1 }}>
                        {promoResult.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, flexShrink: 0,
                      }}
                    >
                      <X size={13} color="#6b7280" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="promo-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
                        border: `1.5px solid ${promoError ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: 8, padding: '0 10px', background: '#fff',
                      }}>
                        <Tag size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                          placeholder="Code promo"
                          style={{
                            flex: 1, border: 'none', outline: 'none',
                            fontSize: 13, fontFamily: 'inherit',
                            padding: '9px 0', background: 'transparent',
                            letterSpacing: '0.05em',
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        style={{
                          padding: '0 14px', background: promoInput.trim() ? '#f97316' : '#e5e7eb',
                          color: promoInput.trim() ? '#fff' : '#9ca3af',
                          border: 'none', borderRadius: 8, cursor: promoInput.trim() ? 'pointer' : 'default',
                          fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                          transition: 'all .15s',
                        }}
                      >
                        {promoLoading ? '...' : 'Appliquer'}
                      </button>
                    </div>
                    {promoError && (
                      <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>{promoError}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Totaux */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6',
                           display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Sous-total</span>
                <span>{fcfa(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Livraison</span>
                <span style={{ color: effectiveDelivery === 0 ? '#16a34a' : '#6b7280' }}>
                  {effectiveDelivery === 0
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ textDecoration: deliveryFee > 0 && promoResult?.discount_type === 'free_delivery' ? 'line-through' : 'none', color: '#9ca3af', fontSize: 11 }}>
                          {deliveryFee > 0 && promoResult?.discount_type === 'free_delivery' ? fcfa(deliveryFee) : ''}
                        </span>
                        Gratuit
                      </span>
                    : fcfa(deliveryFee)
                  }
                </span>
              </div>

              {/* ── Réduction fidélité ── */}
              {loyaltyValue > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #1a3a2a 0%, #111827 100%)',
                  borderRadius: 10, padding: '12px 14px',
                  border: '1px solid rgba(249,115,22,0.25)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Star size={13} color="#f97316" fill="#f97316" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>
                      {loyaltyPts} points fidélité disponibles
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setApplyLoyalty(v => !v)}
                      style={{
                        width: 36, height: 20, borderRadius: 999, border: 'none',
                        cursor: 'pointer', position: 'relative', flexShrink: 0,
                        background: applyLoyalty ? '#f97316' : 'rgba(255,255,255,0.15)',
                        transition: 'background .2s',
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: applyLoyalty ? 19 : 3,
                        transition: 'left .2s',
                      }} />
                    </button>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                      Utiliser{' '}
                      <span style={{ color: '#fb923c', fontWeight: 700 }}>
                        {fcfa(Math.min(loyaltyValue, total))}
                      </span>{' '}
                      de réduction
                    </span>
                    {applyLoyalty && (
                      <Gift size={14} color="#22c55e" />
                    )}
                  </div>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#22c55e' }}>
                  <span>Réduction fidélité</span>
                  <span style={{ fontWeight: 700 }}>− {fcfa(loyaltyDiscount)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#f97316' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} /> Code promo
                  </span>
                  <span style={{ fontWeight: 700 }}>− {fcfa(promoDiscount)}</span>
                </div>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between', paddingTop: 10,
                borderTop: '2px solid #f3f4f6',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>
                  {fcfa(grandTotal)}
                </span>
              </div>
            </div>

            {/* Bouton commander */}
            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '15px', background: isSubmitting ? '#d1d5db' : '#f97316',
                  color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#ea580c' }}
                onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#f97316' }}
              >
                {isSubmitting
                  ? <>
                      <div style={{
                        width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                      Validation en cours...
                    </>
                  : <>
                      <Check size={18} /> Confirmer la commande
                    </>
                }
              </button>

              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                En confirmant, vous acceptez nos{' '}
                <Link to="/legal/terms" style={{ color: '#f97316', textDecoration: 'none' }}>
                  conditions d'utilisation
                </Link>
              </p>
            </div>
          </div>

          {/* Garanties */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔒', text: 'Paiement 100% sécurisé en FCFA' },
              { icon: '📦', text: 'Livraison suivie avec notification' },
              { icon: '↩️', text: 'Retour accepté sous 7 jours' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
