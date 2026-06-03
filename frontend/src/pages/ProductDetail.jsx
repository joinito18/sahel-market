import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, MapPin, Eye, ArrowLeft, Heart,
  Star, Share2, Shield, Truck, RotateCcw,
  ChevronLeft, ChevronRight, Minus, Plus, Check, BadgeCheck, Package,
  Flame, Users, Sparkles
} from 'lucide-react'
import { Link, useNavigate as useNav } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CustomOrderModal from '../components/CustomOrderModal.jsx'
import { productService } from '../services/product.service.js'
import { addItem, openCart } from '../store/cartSlice.js'
import Rating from '../components/Rating.jsx'
import ProductCard from '../components/ProductCard.jsx'
import toast from 'react-hot-toast'

import { imgUrl, fcfa as FCFA } from '../utils/media.js'
import { addRecentlyViewed } from '../utils/recentlyViewed.js'

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

  const [activeImg,     setActiveImg]     = useState(0)
  const [quantity,      setQuantity]      = useState(1)
  const [liked,         setLiked]         = useState(false)
  const [adding,        setAdding]        = useState(false)
  const [zoomOpen,      setZoomOpen]      = useState(false)
  const [zoomScale,     setZoomScale]     = useState(1)
  const [zoomOffset,    setZoomOffset]    = useState({ x: 0, y: 0 })
  const [isDragging,    setIsDragging]    = useState(false)
  const [shareOpen,      setShareOpen]      = useState(false)
  const [selectedVars,   setSelectedVars]   = useState({})
  const [stickyShow,     setStickyShow]     = useState(false)
  const [customModal,    setCustomModal]    = useState(false)
  const dragStart = useRef(null)
  const ctaRef = useRef(null)

  const navTo = useNav()
  const { isAuthenticated, user: me } = useSelector(s => s.auth)

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn:  () => productService.getOne(id),
    retry: 2,
  })

  const product = data?.data

  const { data: relatedData } = useQuery({
    queryKey: ['recommendations', id],
    queryFn:  () => productService.getRecommendations(id),
    enabled:  !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
  const related = relatedData?.data ?? []

  // Fallback : même catégorie — tourne en parallèle, utilisé si recommendations vide
  const categoryId = product?.category?.id
  const { data: sameCatData } = useQuery({
    queryKey: ['similar', categoryId, id],
    queryFn:  () => productService.getAll({ category: categoryId, is_available: true, ordering: '-views_count' }),
    enabled:  !!categoryId,
    select:   (res) => (res.data?.results ?? []).filter(p => String(p.id) !== String(id)).slice(0, 6),
    staleTime: 5 * 60 * 1000,
  })

  const displayRelated = related.length > 0 ? related : (sameCatData ?? [])

  /* Enregistrer dans "récemment vus" */
  useEffect(() => { if (product) addRecentlyViewed(product) }, [product?.id])

  /* Sticky CTA — apparaît quand le CTA principal sort de l'écran */
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setStickyShow(!e.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  /* ── Loading ─────────────────────────────────────────────────── */
  if (isPending) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent
                        rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Chargement du produit...</p>
      </div>
    </div>
  )

  /* ── Erreur / 404 ────────────────────────────────────────────── */
  if (isError || !product) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <ShoppingCart size={28} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700">Produit introuvable</p>
      <div className="flex items-center gap-3">
        <button onClick={() => refetch()}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">
          Réessayer
        </button>
        <button onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline">
          ← Retour
        </button>
      </div>
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
    // Vérifier que toutes les variantes requises sont sélectionnées
    const variantTypes = [...new Set((product.variants || []).map(v => v.type))]
    const missing = variantTypes.filter(t => !selectedVars[t])
    if (missing.length > 0) {
      const labels = { taille: 'Taille', couleur: 'Couleur', matiere: 'Matière', autre: 'Option' }
      toast.error(`Veuillez choisir : ${missing.map(t => labels[t] || t).join(', ')}`)
      return
    }
    setAdding(true)
    const variantLabel     = Object.values(selectedVars).map(v => v.label).join(' · ')
    const variantTypeLabel = Object.values(selectedVars).map(v => v.type_label).join(' / ')
    const variantId        = Object.values(selectedVars).map(v => v.id).sort().join('_')
    dispatch(addItem({
      ...product,
      price:          effectivePrice,
      main_image:     images[0]?.image || product.main_image,
      variantId:      variantId || undefined,
      variantLabel:   variantLabel || undefined,
      variantTypeLabel: variantTypeLabel || undefined,
      quantity,
    }))
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

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  // Zoom handlers
  const handleZoomWheel = (e) => {
    e.preventDefault()
    setZoomScale(s => {
      const next = s + (e.deltaY < 0 ? 0.4 : -0.4)
      const clamped = Math.max(1, Math.min(5, next))
      if (clamped <= 1) setZoomOffset({ x: 0, y: 0 })
      return clamped
    })
  }

  const handleZoomMouseDown = (e) => {
    if (zoomScale <= 1) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - zoomOffset.x, y: e.clientY - zoomOffset.y }
  }

  const handleZoomMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return
    setZoomOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  const handleZoomMouseUp = () => { setIsDragging(false); dragStart.current = null }

  const closeZoom = () => { setZoomOpen(false); setZoomScale(1); setZoomOffset({ x: 0, y: 0 }) }

  // Variants — calcul du prix avec extra_price
  const variantExtraTotal = Object.values(selectedVars).reduce((sum, v) => sum + Number(v.extra_price || 0), 0)
  const effectivePrice    = Number(product?.flash_price && product?.is_flash_active ? product.flash_price : product?.price || 0) + variantExtraTotal

  const avgRating    = product.average_rating || 0
  const ratingCount  = product.ratings?.length || 0
  const userRating   = product.user_rating  || 0
  const userComment  = product.user_comment || ''

  /* Compteur "personnes regardent" — déterministe par id pour rester cohérent */
  const watching = ((product.id * 7 + 13) % 18) + 5

  return (
    <>
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

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ════════════════════════════════════════════════════
              GALERIE IMAGES
          ════════════════════════════════════════════════════ */}
          <div className="space-y-3">

            {/* Image principale */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden
                            border border-gray-100 shadow-sm group"
                 onClick={() => mainImage && setZoomOpen(true)}
                 style={{ cursor: mainImage ? 'zoom-in' : 'default' }}>
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
                  onClick={handleShareFacebook}
                  title="Partager sur Facebook"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl shadow-md
                             flex items-center justify-center transition-colors
                             bg-blue-600 hover:bg-blue-700 text-white"
                  style={{ fontSize: 11, fontWeight: 900 }}
                >
                  FB
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
          <div className="flex flex-col gap-6">

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
            <h1 className="serif-xl">{product.name}</h1>

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
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-100">
              <span className="price-tag" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', color: product.is_flash_active ? '#DC2626' : 'var(--ink)' }}>
                {FCFA(effectivePrice)} <span style={{ fontSize: '0.55em', fontWeight: 600, color: 'var(--ink-2)' }}>FCFA</span>
              </span>
              {product.is_flash_active && (
                <span className="text-sm line-through text-gray-400">{FCFA(product.price)} FCFA</span>
              )}
              {isLowStock && (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
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

            {/* Commander sur-mesure */}
            {me?.id !== product.producer_id && (
              <button
                onClick={() => setCustomModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '11px 16px', borderRadius: 12,
                  border: '1.5px solid #E8E7E2', background: '#F5F4EF',
                  fontSize: 13, fontWeight: 700, color: '#111111',
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#d97706'; e.currentTarget.style.background='#FFF7ED' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E8E7E2'; e.currentTarget.style.background='#F5F4EF' }}
              >
                <Sparkles size={15} color="#d97706" />
                Commander sur-mesure
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

            {/* Variants */}
            {product.variants?.length > 0 && (() => {
              const byType = product.variants.reduce((acc, v) => {
                if (!acc[v.type]) acc[v.type] = { label: v.type_label, options: [] }
                acc[v.type].options.push(v)
                return acc
              }, {})
              return Object.entries(byType).map(([type, { label, options }]) => (
                <div key={type}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {label}
                    {selectedVars[type] && (
                      <span className="ml-2 text-orange-500 font-bold">{selectedVars[type].label}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map(v => {
                      const active = selectedVars[type]?.id === v.id
                      const outOfStock = v.stock === 0
                      return (
                        <button key={v.id} disabled={outOfStock}
                          onClick={() => setSelectedVars(s => ({ ...s, [type]: active ? undefined : v }))}
                          style={{
                            padding: type === 'couleur' ? '0' : '6px 14px',
                            borderRadius: type === 'couleur' ? '50%' : 8,
                            width: type === 'couleur' ? 32 : 'auto',
                            height: type === 'couleur' ? 32 : 'auto',
                            background: type === 'couleur' ? v.label : active ? '#111' : '#f9f9f9',
                            border: active ? '2px solid #111' : '2px solid #e5e7eb',
                            color: type === 'couleur' ? 'transparent' : active ? '#fff' : '#374151',
                            fontSize: 12, fontWeight: 600, cursor: outOfStock ? 'not-allowed' : 'pointer',
                            opacity: outOfStock ? 0.4 : 1,
                            boxShadow: active ? '0 0 0 3px rgba(17,17,17,0.15)' : 'none',
                            transition: 'all .15s',
                          }}>
                          {type !== 'couleur' && v.label}
                          {Number(v.extra_price) > 0 && type !== 'couleur' && (
                            <span style={{ fontSize: 10, marginLeft: 4, color: active ? '#ccc' : '#9ca3af' }}>
                              +{Number(v.extra_price).toLocaleString('fr-FR')}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            })()}

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
              ref={ctaRef}
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
                      : `Ajouter au panier · ${FCFA(effectivePrice * quantity)}`
                    }
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Points de fidélité à gagner */}
            {!isOutOfStock && (() => {
              const pts = Math.floor(effectivePrice * quantity / 500)
              if (pts <= 0) return null
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                  background: '#FFF7ED', borderRadius: 12, padding: '10px 14px',
                  border: '1px solid #FED7AA' }}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#EA580C' }}>
                      Cette commande vous rapporte {pts} point{pts > 1 ? 's' : ''}
                    </p>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                      = {(pts * 5).toLocaleString('fr-FR')} FCFA utilisables sur votre prochaine commande
                    </p>
                  </div>
                </div>
              )
            })()}

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
            STICKY CTA MOBILE
        ════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {stickyShow && !isOutOfStock && (
            <motion.div
              initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              style={{ position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 50,
                padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e7eb',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'center' }}
              className="lg:hidden"
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#2D6A4F' }}>{FCFA(product.price * quantity)} FCFA</p>
              </div>
              <button onClick={handleAddToCart}
                style={{ flexShrink: 0, background: '#111', color: '#fff', border: 'none', borderRadius: 14,
                  padding: '13px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={16} /> Ajouter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════
            LIGHTBOX ZOOM (scroll pour zoomer, drag pour déplacer)
        ════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {zoomOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onWheel={handleZoomWheel}
              onMouseMove={handleZoomMouseMove}
              onMouseUp={handleZoomMouseUp}
              onMouseLeave={handleZoomMouseUp}
              onClick={zoomScale <= 1 ? closeZoom : undefined}
              style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-out',
                userSelect: 'none', overflow: 'hidden' }}
            >
              <motion.img
                src={mainImage}
                alt={product.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onMouseDown={handleZoomMouseDown}
                onClick={e => e.stopPropagation()}
                style={{
                  maxWidth: '92vw', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain',
                  transform: `scale(${zoomScale}) translate(${zoomOffset.x / zoomScale}px, ${zoomOffset.y / zoomScale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease',
                  cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                }}
              />

              {/* Navigation images dans le zoom */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); setZoomScale(1); setZoomOffset({ x:0,y:0 }) }}
                    style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:44,height:44,borderRadius:'50%',
                      background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ChevronLeft size={22} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); setZoomScale(1); setZoomOffset({ x:0,y:0 }) }}
                    style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:44,height:44,borderRadius:'50%',
                      background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Boutons zoom + / - */}
              <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
                <button onClick={(e) => { e.stopPropagation(); setZoomScale(s => Math.min(5, s+0.5)) }}
                  style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:22, display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
                <button onClick={(e) => { e.stopPropagation(); setZoomScale(s => { const n = Math.max(1,s-0.5); if(n<=1) setZoomOffset({x:0,y:0}); return n }) }}
                  style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:22, display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12, display:'flex', alignItems:'center', padding:'0 8px' }}>
                  {Math.round(zoomScale * 100)}%
                </span>
              </div>

              {/* Hint */}
              {zoomScale === 1 && (
                <p style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.5)', fontSize:12 }}>
                  Molette pour zoomer · Clic sur fond pour fermer
                </p>
              )}

              {/* Fermer */}
              <button onClick={closeZoom}
                style={{ position:'absolute', top:16, right:16, width:44,height:44,borderRadius:'50%',
                  background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer',
                  color:'#fff', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center' }}>
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════
            RECOMMANDATIONS INTELLIGENTES
        ════════════════════════════════════════════════════════ */}
        {displayRelated.length > 0 && (
          <div style={{
            marginTop: 32, background: 'var(--surface)',
            borderRadius: 20, border: '1px solid var(--border)', padding: 'clamp(20px,3vw,32px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p className="label-caps" style={{ marginBottom: 8 }}>
                  {related.length > 0 ? 'Sélectionnés pour vous' : 'Dans la même catégorie'}
                </p>
                <h2 className="serif-lg">Vous aimerez aussi</h2>
              </div>
              <Link to={product?.category ? `/products?category=${product.category}` : '/products'}
                className="label-caps" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                Voir tout →
              </Link>
            </div>
            <div className="product-grid-home">
              {displayRelated.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Modal commande sur-mesure */}
      <CustomOrderModal
        open={customModal}
        onClose={() => setCustomModal(false)}
        producer={{ id: product.producer_id, username: product.producer_name, name: product.producer_name }}
        product={product}
      />
    </>
  )
}