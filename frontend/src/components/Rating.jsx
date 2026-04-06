import { useState } from 'react'
import { Star } from 'lucide-react'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'

export default function Rating({ productId, currentRating = 0, onRated }) {
  const [hovered, setHovered]   = useState(0)
  const [selected, setSelected] = useState(currentRating)
  const [loading, setLoading]   = useState(false)

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
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={loading}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(star)}
          className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            size={20}
            className={star <= (hovered || selected) ? 'text-sahel-accent fill-sahel-accent' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}