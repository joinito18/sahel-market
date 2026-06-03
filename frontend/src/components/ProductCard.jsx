import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, ShoppingBag, Flame, BadgeCheck, Bell, BellOff, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { addItem, openCart } from '../store/cartSlice.js'
import { toggleLike } from '../store/wishlistSlice.js'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'
import { imgUrl, fcfa } from '../utils/media.js'

function useFlashCountdown(flashEnd) {
  const [remaining, setRemaining] = useState(null)
  useEffect(() => {
    if (!flashEnd) return
    const tick = () => {
      const diff = Math.max(0, new Date(flashEnd) - Date.now())
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(diff > 0 ? `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s` : null)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [flashEnd])
  return remaining
}

export default function ProductCard({ product, index = 0 }) {
  const dispatch  = useDispatch()
  const user      = useSelector(s => s.auth.user)
  const likedIds  = useSelector(s => s.wishlist.ids)
  const liked     = likedIds.includes(product.id)
  const [imgErr,  setImgErr]  = useState(false)
  const [img2Err, setImg2Err] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [adding,  setAdding]  = useState(false)
  const [hasAlert, setHasAlert] = useState(product.user_has_alert ?? false)
  const [alertLoading, setAlertLoading] = useState(false)

  const isFlash      = product.is_flash_active && product.flash_price
  const displayPrice = isFlash ? product.flash_price : product.price
  const countdown    = useFlashCountdown(isFlash ? product.flash_end : null)

  const src  = imgUrl(product.main_image)
  const src2 = imgUrl(product.second_image)
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5
  const watching     = ((product.id * 7 + 13) % 8) + 3

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (isOutOfStock) return
    setAdding(true)
    dispatch(addItem({ ...product, price: displayPrice }))
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

  const handleAlert = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { toast.error('Connectez-vous pour activer cette alerte'); return }
    if (alertLoading) return
    setAlertLoading(true)
    try {
      const { data } = await productService.toggleAlert(product.id)
      setHasAlert(data.subscribed)
      toast.success(data.subscribed ? 'Alerte activée — on vous prévient dès le retour en stock !' : 'Alerte désactivée')
    } catch {
      toast.error('Erreur lors de l\'inscription à l\'alerte')
    } finally {
      setAlertLoading(false)
    }
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

          {src2 && !img2Err && (
            <img src={src2} alt="" onError={() => setImg2Err(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'opacity 0.4s ease, transform 0.5s ease' }}
            />
          )}

          {/* Badge vente flash */}
          {isFlash && countdown && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: '#DC2626', color: '#fff',
              fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 5,
              letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Flame size={9} style={{ fill: '#fff' }} /> FLASH · {countdown}
            </div>
          )}

          {/* Badge stock bas (sans flash) */}
          {isLowStock && !isFlash && (
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(239,68,68,0.92)', backdropFilter: 'blur(4px)',
              color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em' }}>
              <Flame size={9} style={{ fill: '#fff' }} />
              Plus que {product.stock}
            </div>
          )}

          {/* Overlay rupture + bouton alerte */}
          {isOutOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ background: '#fff', color: '#111', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 4, letterSpacing: '0.06em' }}>ÉPUISÉ</span>
              <button onClick={handleAlert}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: hasAlert ? '#2D6A4F' : 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 12px', borderRadius: 20,
                  cursor: 'pointer', letterSpacing: '0.04em' }}>
                {hasAlert ? <BellOff size={11} /> : <Bell size={11} />}
                {hasAlert ? 'Alerte active' : 'M\'avertir'}
              </button>
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
                style={{ width: '100%', padding: '11px', background: isFlash ? '#DC2626' : '#111', color: '#fff',
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
            <p style={{ fontSize: 10, fontWeight: 600, color: '#ADADAD', letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
              {product.producer_name}
              {product.producer_is_verified && (
                <BadgeCheck size={11} color="#2D6A4F" strokeWidth={2.5} title="Artisan vérifié" />
              )}
            </p>
          )}
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111111', lineHeight: 1.4, marginBottom: 4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>

          {!isOutOfStock && product.views_count > 5 && (
            <p style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={10} color="#2D6A4F" strokeWidth={2} /> {watching} personnes regardent
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: isFlash ? '#DC2626' : '#111111' }}>
                {fcfa(displayPrice)}{' '}
                <span style={{ fontSize: 10, fontWeight: 400, color: '#ADADAD' }}>FCFA</span>
              </p>
              {isFlash && (
                <p style={{ fontSize: 10, color: '#ADADAD', textDecoration: 'line-through', marginTop: -2 }}>
                  {fcfa(product.price)} FCFA
                </p>
              )}
            </div>
            {!isOutOfStock && (
              <motion.button onClick={handleAddToCart}
                animate={adding ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: adding ? '#2D6A4F' : (isFlash ? '#DC2626' : '#111'),
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
