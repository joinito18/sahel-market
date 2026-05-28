import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, ShoppingBag, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { addItem, openCart } from '../store/cartSlice.js'
import { toggleLike } from '../store/wishlistSlice.js'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'
import { imgUrl, fcfa } from '../utils/media.js'

export default function ProductCard({ product, index = 0 }) {
  const dispatch  = useDispatch()
  const likedIds  = useSelector(s => s.wishlist.ids)
  const liked     = likedIds.includes(product.id)
  const [imgErr,  setImgErr]  = useState(false)
  const [img2Err, setImg2Err] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [adding,  setAdding]  = useState(false)

  const src  = imgUrl(product.main_image)
  const src2 = imgUrl(product.second_image)
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5
  const watching     = ((product.id * 7 + 13) % 8) + 3

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (isOutOfStock) return
    setAdding(true)
    dispatch(addItem(product))
    dispatch(openCart())
    toast.success('Ajouté au panier')
    setTimeout(() => setAdding(false), 800)
  }

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation()
    dispatch(toggleLike(product.id))
    try { await productService.like(product.id) }
    catch { dispatch(toggleLike(product.id)); toast.error('Connectez-vous pour ajouter aux favoris') }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.35 }}
    >
      <Link to={`/products/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>

        {/* ── Image ──────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#F0EFE9', borderRadius: 12, marginBottom: 10 }}
        >
          {/* Image principale */}
          {src && !imgErr ? (
            <img src={src} alt={product.name} onError={() => setImgErr(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: (hovered && src2 && !img2Err) ? 0 : 1,
                transform: hovered && !(src2 && !img2Err) ? 'scale(1.04)' : 'scale(1)',
                transition: 'opacity 0.4s ease, transform 0.5s ease' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDECEA' }}>
              <ShoppingBag size={28} color="#D4D3CE" strokeWidth={1} />
            </div>
          )}

          {/* Deuxième image au survol */}
          {src2 && !img2Err && (
            <img src={src2} alt="" onError={() => setImg2Err(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'opacity 0.4s ease, transform 0.5s ease' }}
            />
          )}

          {/* Badge stock bas */}
          {isLowStock && (
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(239,68,68,0.92)', backdropFilter: 'blur(4px)',
              color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em' }}>
              <Flame size={9} style={{ fill: '#fff' }} />
              Plus que {product.stock}
            </div>
          )}

          {/* Overlay rupture */}
          {isOutOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#fff', color: '#111', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 4, letterSpacing: '0.06em' }}>ÉPUISÉ</span>
            </div>
          )}

          {/* Bouton like */}
          <button onClick={handleLike}
            style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%',
              background: liked ? '#111' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
            <Heart size={14} color={liked ? '#fff' : '#111'} fill={liked ? '#fff' : 'none'} strokeWidth={liked ? 2 : 1.8} />
          </button>

          {/* Bouton ajout rapide au survol */}
          {!isOutOfStock && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.22s ease' }}>
              <button onClick={handleAddToCart}
                style={{ width: '100%', padding: '11px', background: '#111', color: '#fff',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ShoppingBag size={13} /> AJOUTER AU PANIER
              </button>
            </div>
          )}
        </div>

        {/* ── Infos ──────────────────────────────────────────── */}
        <div style={{ padding: '0 2px' }}>
          {product.producer_name && (
            <p style={{ fontSize: 10, fontWeight: 600, color: '#ADADAD', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
              {product.producer_name}
            </p>
          )}
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111111', lineHeight: 1.4, marginBottom: 4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>

          {/* Personnes qui regardent */}
          {!isOutOfStock && product.views_count > 5 && (
            <p style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 600, marginBottom: 4 }}>
              👁 {watching} personnes regardent
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
              {fcfa(product.price)}{' '}
              <span style={{ fontSize: 10, fontWeight: 400, color: '#ADADAD' }}>FCFA</span>
            </p>
            {!isOutOfStock && (
              <motion.button onClick={handleAddToCart}
                animate={adding ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: adding ? '#2D6A4F' : '#111',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .2s', flexShrink: 0 }}>
                <AnimatePresence mode="wait">
                  {adding
                    ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</motion.span>
                    : <motion.span key="cart"><ShoppingBag size={13} color="#fff" strokeWidth={2} /></motion.span>
                  }
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
