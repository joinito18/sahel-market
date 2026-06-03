import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, Package, Info } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function CustomOrderModal({ open, onClose, producer, product }) {
  const { isAuthenticated } = useSelector(s => s.auth)
  const navigate = useNavigate()

  const [form, setForm] = useState({ description: '', budget: '', quantity: 1 })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!open) return null

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    if (!form.description.trim()) { toast.error('Décrivez votre demande.'); return }

    setLoading(true)
    try {
      await api.post('/orders/custom/', {
        producer_id: producer.id,
        product:     product?.id ?? null,
        description: form.description.trim(),
        budget:      form.budget ? Number(form.budget) : null,
        quantity:    Number(form.quantity) || 1,
      })
      toast.success('Demande envoyée ! L\'artisan vous répondra via la plateforme.')
      setForm({ description: '', budget: '', quantity: 1 })
      onClose()
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const producerName = producer?.first_name || producer?.name || producer?.username || 'l\'artisan'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .97 }}
            transition={{ duration: .22, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 101,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '100%', maxWidth: 480,
              background: '#fff', borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}>

              {/* Header */}
              <div style={{
                background: '#111111', padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(217,119,6,0.15)',
                  border: '1px solid rgba(217,119,6,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Package size={17} color="#d97706" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                    Commander sur-mesure
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    Votre demande sera transmise via Sahel Market
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} color="rgba(255,255,255,0.6)" />
                </button>
              </div>

              {/* Info bannière */}
              <div style={{
                background: '#FFF7ED',
                borderBottom: '1px solid #FED7AA',
                padding: '10px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Info size={13} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                  Toutes les communications passent par <strong>Sahel Market</strong>.
                  Aucune coordonnée personnelle n'est partagée.
                </p>
              </div>

              {/* Corps */}
              <form onSubmit={handleSubmit} style={{ padding: '20px' }}>

                {product && (
                  <div style={{
                    background: '#F5F4EF', borderRadius: 10,
                    padding: '10px 14px', marginBottom: 18,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Package size={14} color="#ADADAD" />
                    <div>
                      <p style={{ fontSize: 11, color: '#ADADAD', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Basé sur</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{product.name}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '0.04em' }}>
                    Décrivez votre besoin *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder={`Ex : Je souhaite un sac en cuir similaire mais en couleur marron, avec une bandoulière ajustable et mes initiales gravées…`}
                    rows={4}
                    required
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      border: '1.5px solid #E8E7E2', borderRadius: 10,
                      padding: '10px 12px', fontSize: 13, lineHeight: 1.5,
                      outline: 'none', resize: 'vertical',
                      background: '#F5F4EF', color: '#111',
                      fontFamily: 'inherit', transition: 'border-color .15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#d97706'}
                    onBlur={e  => e.target.style.borderColor = '#E8E7E2'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {/* Budget */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 6 }}>
                      Budget estimé (FCFA)
                    </label>
                    <input
                      type="number" min="0" value={form.budget}
                      onChange={e => set('budget', e.target.value)}
                      placeholder="Optionnel"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: '1.5px solid #E8E7E2', borderRadius: 10,
                        padding: '9px 12px', fontSize: 13, outline: 'none',
                        background: '#F5F4EF', color: '#111',
                        fontFamily: 'inherit', transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#d97706'}
                      onBlur={e  => e.target.style.borderColor = '#E8E7E2'}
                    />
                  </div>

                  {/* Quantité */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 6 }}>
                      Quantité
                    </label>
                    <input
                      type="number" min="1" max="999" value={form.quantity}
                      onChange={e => set('quantity', e.target.value)}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: '1.5px solid #E8E7E2', borderRadius: 10,
                        padding: '9px 12px', fontSize: 13, outline: 'none',
                        background: '#F5F4EF', color: '#111',
                        fontFamily: 'inherit', transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#d97706'}
                      onBlur={e  => e.target.style.borderColor = '#E8E7E2'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button" onClick={onClose}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 10,
                      border: '1.5px solid #E8E7E2', background: '#fff',
                      fontSize: 13, fontWeight: 600, color: '#6B6B6B',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit" disabled={loading}
                    style={{
                      flex: 2, padding: '12px', borderRadius: 10,
                      border: 'none', background: loading ? '#E8E7E2' : '#111111',
                      fontSize: 13, fontWeight: 700, color: loading ? '#ADADAD' : '#fff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all .15s',
                    }}
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {loading ? 'Envoi…' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
