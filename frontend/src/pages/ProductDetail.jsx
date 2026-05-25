import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, MapPin, Eye, ArrowLeft, Heart,
  Star, Share2, Shield, Truck, RotateCcw,
  ChevronLeft, ChevronRight, Minus, Plus, Check, BadgeCheck, Package,
  Flame, Users, MessageCircle
} from 'lucide-react'
import { Link, useNavigate as useNav } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { productService } from '../services/product.service.js'
import { addItem, openCart } from '../store/cartSlice.js'
import Rating from '../components/Rating.jsx'
import toast from 'react-hot-toast'

import { imgUrl, fcfa as FCFA } from '../utils/media.js'

function StarDisplay({ score, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          className={s <= Math.round(score)
            ? 'text-amber-400 fill-amber-400'
            : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeImg, setActiveImg] = useState(0)
  const [quantity,  setQuantity]  = useState(1)
  const [liked,     setLiked]     = useState(false)
  const [adding,    setAdding]    = useState(false)

  const navTo = useNav()
  const { isAuthenticated, user: me } = useSelector(s => s.auth)

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn:  () => productService.getOne(id),
  })

  const product = data?.data

  const { data: relatedData } = useQuery({
    queryKey: ['related', product?.category?.id, id],
    queryFn:  () => productService.getAll({ category: product.category.id, page_size: 7 }),
    enabled:  !!product?.category?.id,
  })
  const related = (relatedData?.data?.results ?? []).filter(p => p.id !== Number(id)).slice(0, 6)

  /* ── Loading ─────────────────────────────────────────────────── */
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent
                        rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Chargement du produit...</p>
      </div>
    </div>
  )

  /* ── 404 ─────────────────────────────────────────────────────── */
  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <ShoppingCart size={28} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700">Produit introuvable</p>
      <button onClick={() => navigate(-1)}
        className="text-sm text-orange-500 hover:underline">
        ← Retour
      </button>
    </div>
  )

  const images = product.images?.length
    ? product.images
    : [{ image: null, is_main: true }]

  const mainImage = imgUrl(images[activeImg]?.image)
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5

  const handleAddToCart = async () => {
    if (isOutOfStock) return
    setAdding(true)
    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({
        ...product,
        main_image: images[0]?.image || product.main_image
      }))
    }
    dispatch(openCart())
    toast.success(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`)
    setTimeout(() => setAdding(false), 1200)
  }

  const handleLike = async () => {
    setLiked(l => !l)
    try { await productService.like(product.id) }
    catch { setLiked(l => !l) }
  }

  const handleShare = () => {
    const price = Number(product.price).toLocaleString('fr-FR')
    const text = `🛒 *${product.name}*\n💰 ${price} FCFA\n\n✨ Produit artisanal camerounais sur Sahel Market :\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié !')
    } catch {
      toast.error('Impossible de copier')
    }
  }

  const avgRating    = product.average_rating || 0
  const ratingCount  = product.ratings?.length || 0
  const userRating   = product.user_rating  || 0
  const userComment  = product.user_comment || ''

  /* Compteur "personnes regardent" — déterministe par id pour rester cohérent */
  const watching = ((product.id * 7 + 13) % 18) + 5

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Breadcrumb / retour ───────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 hover:text-orange-500
                         transition-colors font-medium"
            >
              <ArrowLeft size={13} /> Retour
            </button>
            <span>/</span>
            <span className="text-gray-400">Catalogue</span>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ════════════════════════════════════════════════════
              GALERIE IMAGES
          ════════════════════════════════════════════════════ */}
          <div className="space-y-3">

            {/* Image principale */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden
                            border border-gray-100 shadow-sm group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center
                                    justify-center gap-3 bg-gray-50">
                      <ShoppingCart size={48} className="text-gray-200" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav image prev/next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-9 sm:h-9
                               bg-white/90 backdrop-blur-sm rounded-xl shadow-md
                               flex items-center justify-center
                               sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                               hover:bg-white"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-9 sm:h-9
                               bg-white/90 backdrop-blur-sm rounded-xl shadow-md
                               flex items-center justify-center
                               sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                               hover:bg-white"
                  >
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Actions top-right */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  onClick={handleLike}
                  className={`w-11 h-11 sm:w-9 sm:h-9 rounded-xl shadow-md flex items-center
                              justify-center transition-all duration-200
                              ${liked
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:bg-white'
                              }`}
                >
                  <Heart size={16} className={liked ? 'fill-white' : ''} />
                </button>
                <button
                  onClick={handleShare}
                  title="Partager sur WhatsApp"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl shadow-md
                             flex items-center justify-center transition-colors
                             bg-green-500 hover:bg-green-600 text-white"
                  style={{ fontSize: 11, fontWeight: 900 }}
                >
                  WA
                </button>
                <button
                  onClick={handleCopyLink}
                  title="Copier le lien"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-white/90 backdrop-blur-sm shadow-md
                             flex items-center justify-center text-gray-500
                             hover:bg-white transition-colors"
                >
                  <Share2 size={15} />
                </button>
              </div>

              {/* Badge rupture */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-700 font-bold text-sm
                                   px-4 py-2 rounded-full">
                    Rupture de stock
                  </span>
                </div>
              )}

              {/* Compteur images */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                                bg-black/40 backdrop-blur-sm text-white text-xs
                                px-3 py-1 rounded-full font-medium">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => {
                  const src = imgUrl(img.image)
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden
                                  border-2 transition-all duration-150
                                  ${activeImg === i
                                    ? 'border-orange-500 shadow-md shadow-orange-100'
                                    : 'border-gray-200 hover:border-orange-300 opacity-70 hover:opacity-100'
                                  }`}
                    >
                      {src
                        ? <img src={src} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-50 flex items-center justify-center"><ShoppingCart size={18} className="text-gray-200" /></div>
                      }
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════
              INFOS PRODUIT
          ════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-5">

            {/* Catégorie + localisation */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.category?.name && (
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs
                                 font-bold rounded-full border border-orange-100">
                  {product.category.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} /> {product.location || 'Sahel'}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Eye size={11} /> {product.views_count} vues
              </span>
            </div>

            {/* Nom */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating summary */}
            {avgRating > 0 && (
              <div className="flex items-center gap-3">
                <StarDisplay score={avgRating} size={16} />
                <span className="text-sm font-bold text-gray-800">{avgRating}</span>
                <span className="text-sm text-gray-400">
                  ({ratingCount} avis)
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="flex items-baseline gap-3 py-3 border-y border-gray-100">
              <span className="text-3xl font-black text-orange-600 tabular-nums">
                {FCFA(product.price)}
              </span>
              {isLowStock && (
                <span className="text-xs font-bold text-red-500 bg-red-50
                                 px-2 py-1 rounded-full">
                  Plus que {product.stock} en stock !
                </span>
              )}
            </div>

            {/* Vendeur */}
            <Link to={`/artisans/${product.producer_name}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl
                         hover:bg-orange-50 hover:border-orange-200 border border-transparent
                         transition-colors no-underline group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400
                              to-orange-600 flex items-center justify-center
                              flex-shrink-0 shadow-sm">
                <span className="text-white font-black text-sm">
                  {product.producer_name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Vendu par</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600
                               transition-colors">
                  {product.producer_name || 'Artisan local'}
                </p>
              </div>
              <span className="text-xs text-orange-500 font-semibold opacity-0
                               group-hover:opacity-100 transition-opacity">
                Voir le profil →
              </span>
            </Link>

            {/* Contacter l'artisan */}
            {isAuthenticated && me?.id !== product.producer_id && (
              <button
                onClick={() => navTo(`/messages/${product.producer_id}`)}
                className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                           border border-orange-200 bg-orange-50 text-orange-700
                           font-semibold text-sm hover:bg-orange-100 transition-colors"
              >
                <MessageCircle size={15} />
                Contacter l'artisan pour une commande sur-mesure
              </button>
            )}

            {/* Urgence — compteur personnes + stock */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600
                               bg-gray-100 px-3 py-1.5 rounded-full">
                <Users size={12} className="text-orange-500" />
                <span><span className="text-orange-600 font-bold">{watching}</span> personnes regardent ce produit</span>
              </div>
              {isLowStock && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600
                                 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                  <Flame size={12} className="fill-red-500 text-red-500" />
                  Commandez vite — derniers en stock !
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantité */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Quantité</span>
                <div className="flex items-center gap-1 border border-gray-200
                                rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center
                               hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-800
                                   tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center
                               hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stock} disponible{product.stock > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* CTA */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              animate={adding ? {} : {}}
              className={`w-full flex items-center justify-center gap-2.5 py-4
                          text-base font-bold rounded-2xl transition-all duration-200
                          ${isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : adding
                              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5'
                          }`}
            >
              <AnimatePresence mode="wait">
                {adding ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={18} /> Ajouté au panier !
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    {isOutOfStock
                      ? 'Rupture de stock'
                      : `Ajouter au panier · ${FCFA(product.price * quantity)}`
                    }
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Garanties */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: 'Paiement sécurisé' },
                { icon: Truck,  label: 'Livraison suivie'  },
                { icon: RotateCcw, label: 'Retours faciles' },
              ].map(({ icon: Icon, label }) => (
                <div key={label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50
                             rounded-2xl text-center">
                  <Icon size={16} className="text-orange-500" />
                  <span className="text-[11px] text-gray-500 font-medium leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Notation */}
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Notez ce produit
              </p>
              <Rating productId={product.id} userRating={userRating} userComment={userComment} />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            AVIS CLIENTS
        ════════════════════════════════════════════════════════ */}
        {ratingCount > 0 && (
          <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Avis clients
              </h2>
              <div className="flex items-center gap-2">
                <StarDisplay score={avgRating} size={15} />
                <span className="text-sm font-bold text-gray-800">{avgRating}</span>
                <span className="text-sm text-gray-400">/ 5</span>
              </div>
            </div>

            <div className="space-y-4">
              {product.ratings.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-2xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400
                                  to-orange-600 flex items-center justify-center
                                  flex-shrink-0 shadow-sm">
                    <span className="text-white font-black text-sm">
                      {r.user_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">
                          {r.user_name}
                        </span>
                        {r.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold
                                           text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full
                                           border border-emerald-100">
                            <BadgeCheck size={11} className="text-emerald-600" />
                            Achat vérifié
                          </span>
                        )}
                      </div>
                      <StarDisplay score={r.score} size={12} />
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            VOUS AIMEREZ AUSSI — cross-sell même catégorie
        ════════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vous aimerez aussi</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  D'autres créations dans {product.category?.name}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map((p, i) => {
                const src = imgUrl(p.main_image)
                return (
                  <motion.a
                    key={p.id}
                    href={`/products/${p.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex flex-col bg-gray-50 rounded-2xl overflow-hidden
                               border border-gray-100 hover:border-orange-300
                               hover:shadow-md transition-all duration-200 no-underline"
                  >
                    <div className="aspect-square overflow-hidden bg-white">
                      {src
                        ? <img src={src} alt={p.name}
                               className="w-full h-full object-cover group-hover:scale-105
                                          transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-200" />
                          </div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug
                                   group-hover:text-orange-600 transition-colors mb-1">
                        {p.name}
                      </p>
                      <p className="text-sm font-black text-orange-600">
                        {Number(p.price).toLocaleString('fr-FR')} F
                      </p>
                    </div>
                  </motion.a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}