import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Heart, Star, ShoppingCart, MapPin, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { addItem, openCart } from '../store/cartSlice.js'
import { productService } from '../services/product.service.js'
import toast from 'react-hot-toast'

const API = 'http://localhost:8000'
function imgUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API}${path}`
}

const FCFA = (n) => Number(n).toLocaleString('fr-FR')

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const [liked,    setLiked]    = useState(false)
  const [imgError, setImgError] = useState(false)
  const [adding,   setAdding]   = useState(false)

  const src = imgUrl(product.main_image)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    dispatch(addItem(product))
    dispatch(openCart())
    toast.success('Ajouté au panier !')
    setTimeout(() => setAdding(false), 600)
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(l => !l)
    try {
      await productService.like(product.id)
    } catch {
      setLiked(l => !l)
      toast.error('Connectez-vous pour ajouter aux favoris')
    }
  }

  const isOutOfStock  = product.stock === 0
  const isLowStock    = product.stock > 0 && product.stock <= 5
  const isPopular     = product.views_count > 100
  const hasRating     = product.average_rating > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.15 } }}
      className="group"
    >
      <Link
        to={`/products/${product.id}`}
        className="block bg-white rounded-2xl overflow-hidden border border-gray-100
                   hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40
                   transition-all duration-200"
      >
        {/* ── Image ─────────────────────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br
                        from-amber-50 to-orange-50">

          {src && !imgError ? (
            <img
              src={src}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105
                         transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl">🏺</span>
              <span className="text-xs text-gray-300">Pas de photo</span>
            </div>
          )}

          {/* Overlay rupture */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold
                               px-3 py-1.5 rounded-full shadow">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Badge populaire */}
          {isPopular && !isOutOfStock && (
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 bg-orange-500 text-white
                               text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                <Zap size={9} fill="white" /> Populaire
              </span>
            </div>
          )}

          {/* Bouton like */}
          <button
            onClick={handleLike}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center
                        justify-center shadow-md transition-all duration-200
                        ${liked
                          ? 'bg-red-500 scale-100 opacity-100'
                          : 'bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                        }`}
          >
            <Heart
              size={14}
              className={liked ? 'fill-white text-white' : 'text-gray-500'}
            />
          </button>

          {/* Bouton ajout rapide — slide depuis le bas */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0
                            translate-y-full group-hover:translate-y-0
                            transition-transform duration-200 ease-out">
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-orange-500/95 backdrop-blur-sm
                           hover:bg-orange-600 text-white text-xs font-bold
                           flex items-center justify-center gap-1.5
                           transition-colors"
              >
                <ShoppingCart size={13} />
                Ajouter au panier
              </button>
            </div>
          )}
        </div>

        {/* ── Infos ─────────────────────────────────────────────── */}
        <div className="p-3.5">

          {/* Localisation */}
          {product.location && (
            <div className="flex items-center gap-1 text-gray-400 text-[11px] mb-1.5">
              <MapPin size={9} className="flex-shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
          )}

          {/* Nom */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2
                         leading-snug mb-2 group-hover:text-orange-600
                         transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating + vendeur */}
          <div className="flex items-center gap-1.5 mb-3">
            {hasRating ? (
              <>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={10}
                      className={s <= Math.round(product.average_rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                      }
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">
                  ({product.average_rating})
                </span>
              </>
            ) : (
              <span className="text-[11px] text-gray-300 italic">Pas encore noté</span>
            )}
            {product.producer_name && (
              <>
                <span className="text-gray-200 text-[11px]">·</span>
                <span className="text-[11px] text-gray-400 truncate">
                  {product.producer_name}
                </span>
              </>
            )}
          </div>

          {/* Prix + bouton */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-orange-600 tabular-nums">
                  {FCFA(product.price)}
                </span>
                <span className="text-[11px] text-gray-400 font-normal">FCFA</span>
              </div>
              {isLowStock && (
                <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                  Plus que {product.stock} en stock !
                </p>
              )}
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              animate={adding ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center
                          justify-center transition-all duration-150 shadow-sm
                          ${isOutOfStock
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:shadow-orange-200'
                          }`}
            >
              <AnimatePresence mode="wait">
                {adding
                  ? <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-xs font-bold"
                    >✓</motion.span>
                  : <motion.span key="cart" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                      <ShoppingCart size={15} />
                    </motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}