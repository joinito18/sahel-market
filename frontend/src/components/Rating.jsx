import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'

export default function Rating({ productId, userRating = 0, userComment = '', onRated }) {
  const [hovered,  setHovered]  = useState(0)
  const [score,    setScore]    = useState(userRating || 0)
  const [comment,  setComment]  = useState(userComment || '')
  const [loading,  setLoading]  = useState(false)
  const [submitted, setSubmitted] = useState(!!userRating)

  const handleRate = async (star) => {
    setScore(star)
    setSubmitted(false)
  }

  const handleSubmit = async () => {
    if (!score) { toast.error('Choisissez une note'); return }
    setLoading(true)
    try {
      await productService.rate(productId, { score, comment })
      setSubmitted(true)
      toast.success('Avis enregistré !')
      if (onRated) onRated(score)
    } catch {
      toast.error('Connectez-vous pour laisser un avis')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && score) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={18}
                color={s <= score ? '#2D6A4F' : '#d1d5db'}
                fill={s <= score ? '#2D6A4F' : 'none'} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={13} /> Avis enregistré
          </span>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
          Modifier mon avis
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(star => {
          const active = star <= (hovered || score)
          return (
            <button
              key={star}
              disabled={loading}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              style={{
                padding: 2, background: 'none', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transform: hovered === star ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform .1s',
              }}
            >
              <Star size={22} color={active ? '#2D6A4F' : '#d1d5db'} fill={active ? '#2D6A4F' : 'none'} />
            </button>
          )
        })}
        {score > 0 && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#2D6A4F', fontWeight: 700 }}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][score]}
          </span>
        )}
      </div>

      {score > 0 && (
        <>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit (optionnel)…"
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              border: '1px solid #add8bc', outline: 'none',
              fontSize: 13, color: '#374151', resize: 'vertical',
              background: '#fff', lineHeight: 1.5, boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#2D6A4F'}
            onBlur={e => e.target.style.borderColor = '#add8bc'}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: loading ? '#e5e7eb' : '#2D6A4F',
              color: loading ? '#9ca3af' : '#fff',
              fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
            }}
          >
            {loading ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </>
      )}
    </div>
  )
}
