import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { removeItem, updateQuantity } from '../store/cartSlice.js'

const OR  = '#f97316'
const BG  = '#f0f2f5'
const FCFA = n => Number(n).toLocaleString('fr-FR')

export default function Cart() {
  const dispatch = useDispatch()
  const { items, total } = useSelector(s => s.cart)

  const itemCount   = items.reduce((s, i) => s + i.quantity, 0)
  const deliveryFee = total >= 25000 ? 0 : 1500
  const grandTotal  = total + deliveryFee

  if (items.length === 0) return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
    }}>
      <ShoppingBag size={64} color="#d1d5db" strokeWidth={1} />
      <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
        Votre panier est vide
      </p>
      <p style={{ fontSize: 14, color: '#9ca3af' }}>
        Parcourez notre catalogue d'artisanat camerounais.
      </p>
      <Link to="/products" style={{
        padding: '12px 28px', background: OR, color: '#fff',
        borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14,
      }}>
        Voir le catalogue
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '36px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Mon compte
          </p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Mon panier <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({itemCount} article{itemCount > 1 ? 's' : ''})</span>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Liste articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Bannière livraison */}
            <div style={{
              background: deliveryFee === 0 ? '#f0fdf4' : '#fff7ed',
              border: `1px solid ${deliveryFee === 0 ? '#bbf7d0' : '#fed7aa'}`,
              borderRadius: 12, padding: '10px 16px',
              fontSize: 13, fontWeight: 600,
              color: deliveryFee === 0 ? '#15803d' : '#c2410c',
            }}>
              {deliveryFee === 0
                ? '🎉 Livraison offerte sur cette commande !'
                : `Livraison offerte dès 25 000 FCFA — il manque ${FCFA(25000 - total)} FCFA`
              }
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', gap: 16, padding: '16px 20px',
                  borderBottom: idx < items.length - 1 ? '1px solid #f9fafb' : 'none',
                  alignItems: 'flex-start',
                }}>

                  {/* Image */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
                    background: '#f9fafb', flexShrink: 0, border: '1px solid #e5e7eb',
                  }}>
                    {item.main_image
                      ? <img src={item.main_image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛒</div>
                    }
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>
                      {FCFA(item.price)} FCFA / unité
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Contrôle quantité */}
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
                        background: '#fff',
                      }}>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          style={{
                            width: 34, height: 34, border: 'none', background: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#6b7280',
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', padding: '0 12px', minWidth: 32, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          style={{
                            width: 34, height: 34, border: 'none', background: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#6b7280',
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: OR }}>
                          {FCFA(item.price * item.quantity)} FCFA
                        </p>
                        <button
                          onClick={() => dispatch(removeItem(item.id))}
                          style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2',
                            background: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récapitulatif */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: 24, position: 'sticky', top: 24,
          }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 20 }}>
              Récapitulatif
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{FCFA(total)} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Livraison estimée</span>
                {deliveryFee === 0
                  ? <span style={{ color: '#15803d', fontWeight: 700 }}>Offerte 🎉</span>
                  : <span style={{ fontWeight: 600, color: '#111827' }}>{FCFA(deliveryFee)} FCFA</span>
                }
              </div>
              <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 900, color: OR, fontSize: 18 }}>{FCFA(grandTotal)} FCFA</span>
              </div>
            </div>

            <Link
              to="/checkout"
              style={{
                display: 'block', marginTop: 20, padding: '14px 0', textAlign: 'center',
                background: OR, color: '#fff', borderRadius: 12, textDecoration: 'none',
                fontWeight: 700, fontSize: 15,
              }}
            >
              Passer la commande →
            </Link>

            <Link
              to="/products"
              style={{
                display: 'block', marginTop: 10, padding: '11px 0', textAlign: 'center',
                border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 12,
                textDecoration: 'none', fontWeight: 600, fontSize: 13,
              }}
            >
              Continuer mes achats
            </Link>

            <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              Livraison calculée précisément lors de la commande selon votre zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
