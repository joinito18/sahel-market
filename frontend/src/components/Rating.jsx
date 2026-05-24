import { useState } from 'react'
import { Star } from 'lucide-react'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'

export default function Rating({ productId, currentRating = 0, onRated }) {
  const [hovered,  setHovered]  = useState(0)
  const [selected, setSelected] = useState(currentRating)
  const [loading,  setLoading]  = useState(false)

  const handleRate = async (score) => {
    setLoading(true)
    try {
      await productService.rate(productId, { score })
      setSelected(score)
      toast.success('Note enregistrée')
      if (onRated) onRated(score)
    } catch {
      toast.error('Connectez-vous pour noter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const active = star <= (hovered || selected)
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
              transform: hovered === star ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform .1s',
            }}
          >
            <Star
              size={20}
              color={active ? '#f97316' : '#d1d5db'}
              fill={active ? '#f97316' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}
