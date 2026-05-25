import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft,
         Shield, Truck, Award, Users, Zap, MapPin, ArrowRight, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { productService } from '../services/product.service.js'
import { addItem, openCart } from '../store/cartSlice.js'
import toast from 'react-hot-toast'
import { imgUrl, fcfa } from '../utils/media.js'


/* ─── Carte produit ─────────────────────────────────────────────── */
function ProductCard({ product }) {
  const dispatch = useDispatch()
  const [liked,  setLiked]  = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const src = imgUrl(product.main_image)

  function addToCart(e) {
    e.preventDefault()
    dispatch(addItem(product))
    dispatch(openCart())
    toast.success('Ajouté au panier !')
  }

  return (
    <Link to={`/products/${product.id}`}
      className="group bg-white rounded-lg overflow-hidden flex flex-col
                 border border-gray-200 hover:border-orange-400
                 hover:shadow-md transition-all duration-200">

      {/* Photo */}
      <div className="relative overflow-hidden bg-gray-50 flex-shrink-0"
           style={{ aspectRatio: '1' }}>
        {src && !imgErr
          ? <img src={src} alt={product.name} onError={() => setImgErr(true)}
                 className="w-full h-full object-cover group-hover:scale-105
                            transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Package size={24} className="text-gray-200" />
            </div>
        }

        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-gray-700 text-white
                           text-[10px] font-bold px-2 py-0.5 rounded-sm">
            Rupture
          </span>
        )}
        {product.views_count > 150 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white
                           text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-0.5">
            <Zap size={8} fill="currentColor" /> Populaire
          </span>
        )}

        <button onClick={e => { e.preventDefault(); setLiked(l => !l) }}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow
                     flex items-center justify-center opacity-0 group-hover:opacity-100
                     transition-opacity border border-gray-100">
          <Heart size={13} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1">
        {product.location && (
          <p className="flex items-center gap-1 text-gray-400 text-[10px] mb-1 truncate">
            <MapPin size={9} />{product.location}
          </p>
        )}
        <p className="text-xs text-gray-800 line-clamp-2 leading-snug mb-2 flex-1
                      group-hover:text-orange-600 transition-colors font-medium">
          {product.name}
        </p>

        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className={
                s <= Math.round(product.average_rating)
                  ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
              } />
            ))}
            <span className="text-[10px] text-gray-400">
              ({product.ratings_count ?? 0})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2
                        border-t border-gray-100">
          <p className="text-sm font-extrabold text-orange-600">
            {fcfa(product.price)}
          </p>
          <button onClick={addToCart} disabled={product.stock === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold
                       rounded text-white transition-colors
                       bg-orange-500 hover:bg-orange-600
                       disabled:bg-gray-200 disabled:cursor-not-allowed">
            <ShoppingCart size={11} /> Ajouter
          </button>
        </div>
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-1/2" />
        <div className="h-2.5 bg-gray-100 rounded w-4/5" />
        <div className="h-2.5 bg-gray-100 rounded w-3/5" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gray-100 rounded w-2/5" />
          <div className="h-6 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

/* ─── Carousel horizontal ──────────────────────────────────────── */
function Carousel({ products, loading, count = 6 }) {
  const ref = useRef(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)
  const check = useCallback(() => {
    const el = ref.current; if (!el) return
    setCanL(el.scrollLeft > 8)
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.addEventListener('scroll', check); check()
    return () => el.removeEventListener('scroll', check)
  }, [products, check])
  const scroll = dir => ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })

  return (
    <div className="relative -mx-1">
      {canL && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white
                     border border-gray-300 rounded-full shadow flex items-center
                     justify-center hover:border-orange-400 transition-colors">
          <ChevronLeft size={15} className="text-gray-600" />
        </button>
      )}
      {canR && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white
                     border border-gray-300 rounded-full shadow flex items-center
                     justify-center hover:border-orange-400 transition-colors">
          <ChevronRight size={15} className="text-gray-600" />
        </button>
      )}
      <div ref={ref} className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44"><CardSkeleton /></div>
            ))
          : products.map(p => (
              <div key={p.id} className="flex-shrink-0 w-44"><ProductCard product={p} /></div>
            ))
        }
      </div>
    </div>
  )
}

/* ─── Section titre ─────────────────────────────────────────────── */
function SectionHeader({ title, sub, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-orange-500 rounded-full" />
        <div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15 }}
              className="text-gray-900 m-0">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {to && (
        <Link to={to}
          className="flex items-center gap-1 text-xs font-semibold text-orange-500
                     hover:text-orange-700 transition-colors whitespace-nowrap">
          Voir tout <ChevronRight size={13} />
        </Link>
      )}
    </div>
  )
}

/* ─── Section catégorie ─────────────────────────────────────────── */
function CatSection({ category }) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'cat', category.id],
    queryFn:  () => productService.getAll({
      category: category.id, ordering: '-views_count', page_size: 10,
    }),
  })
  const products = data?.data?.results ?? []
  if (!isLoading && products.length === 0) return null
  const src = imgUrl(category.image)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-50 border
                          border-orange-100 flex items-center justify-center flex-shrink-0">
            {src
              ? <img src={src} alt={category.name} className="w-full h-full object-cover" />
              : <Package size={16} className="text-gray-300" />
            }
          </div>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14 }}
                className="text-gray-900">
            {category.name}
          </span>
          {!isLoading && (
            <span className="text-[11px] text-gray-400">
              ({data?.data?.count ?? products.length})
            </span>
          )}
        </div>
        <Link to={`/products?category=${category.id}`}
          className="text-xs font-semibold text-orange-500 hover:text-orange-700
                     flex items-center gap-0.5">
          Tout voir <ChevronRight size={13} />
        </Link>
      </div>
      <Carousel products={products} loading={isLoading} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate  = useNavigate()
  const [slide, setSlide] = useState(0)

  const { data: catsData }    = useQuery({ queryKey: ['categories'], queryFn: () => productService.getCategories() })
  const { data: statsData }   = useQuery({ queryKey: ['stats'], queryFn: () => productService.getStats(), staleTime: 300000 })
  const { data: featData, isLoading: loadFeat } = useQuery({ queryKey: ['feat'], queryFn: () => productService.getAll({ ordering: '-views_count', page_size: 12 }) })
  const { data: newData,  isLoading: loadNew  } = useQuery({ queryKey: ['new'],  queryFn: () => productService.getAll({ ordering: '-created_at',  page_size: 10 }) })

  const categories  = Array.isArray(catsData?.data) ? catsData.data : (catsData?.data?.results ?? [])
  const stats       = statsData?.data ?? {}
  const featured    = featData?.data?.results ?? []
  const newProducts = newData?.data?.results  ?? []

  /* Slides hero */
  const SLIDES = [
    {
      bg: '#1a3a2a',
      accent: '#f97316',
      tag: '🇨🇲 100% Made in Cameroun',
      title: ["L'artisanat", 'camerounais', 'livre chez vous'],
      titleColor: [false, true, false],
      sub: 'Sacs, chaussures, bijoux et bien plus — fabriqués à la main par nos artisans.',
      btn: 'Découvrir le catalogue',
      btn2: 'Devenir vendeur',
      to: '/products',
      to2: '/register',
    },
    {
      bg: '#1a1200',
      accent: '#f59e0b',
      tag: '👜 Maroquinerie du Nord',
      title: ['Sacs & portefeuilles', 'en cuir naturel', 'de Maroua'],
      titleColor: [false, true, false],
      sub: 'Tannés et cousus à la main selon les savoir-faire ancestraux du Sahel.',
      btn: 'Voir les sacs',
      btn2: 'Explorer tout',
      to: '/products',
      to2: '/products',
    },
    {
      bg: '#0f0f2e',
      accent: '#a78bfa',
      tag: '👗 Mode africaine',
      title: ['Robes, boubous', 'et pagnes wax', 'sur mesure'],
      titleColor: [false, true, false],
      sub: 'Couturières professionnelles, tissus authentiques, tailles S à 3XL.',
      btn: 'Voir la mode',
      btn2: 'Explorer tout',
      to: '/products',
      to2: '/products',
    },
  ]
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [])

  const sl = SLIDES[slide]

  return (
    <div className="min-h-screen" style={{ background: '#f0f2f5' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER — pleine largeur, couleurs solides
      ══════════════════════════════════════════════════════════ */}
      <div style={{ background: sl.bg }} className="relative overflow-hidden">

        {/* Cercle décoratif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 50%, ${sl.accent}22 0%, transparent 70%)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Texte */}
            <AnimatePresence mode="wait">
              <motion.div key={slide}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}     transition={{ duration: 0.35 }}>

                {/* Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 sm:mb-6"
                  style={{ background: `${sl.accent}22`, border: `1px solid ${sl.accent}44` }}>
                  <span className="text-xs font-bold"
                        style={{ color: sl.accent }}>{sl.tag}</span>
                </div>

                {/* Titre */}
                <div className="mb-3 sm:mb-5">
                  {sl.title.map((line, i) => (
                    <div key={i}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 900,
                        fontSize: 'clamp(28px, 8vw, 52px)',
                        lineHeight: 1.08,
                        color: sl.titleColor[i] ? sl.accent : '#ffffff',
                        letterSpacing: '-0.02em',
                      }}>
                      {line}
                    </div>
                  ))}
                </div>

                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6 }}
                   className="mb-4 sm:mb-8 max-w-md">
                  {sl.sub}
                </p>

                {/* Boutons */}
                <div className="flex flex-wrap gap-3 mb-4 sm:mb-8">
                  <Link to={sl.to}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                               font-bold text-sm text-white transition-all
                               hover:opacity-90 hover:-translate-y-0.5"
                    style={{ background: sl.accent }}>
                    {sl.btn} <ArrowRight size={15} />
                  </Link>
                  <Link to={sl.to2}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                               font-semibold text-sm text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)',
                             border: '1px solid rgba(255,255,255,0.2)' }}>
                    {sl.btn2}
                  </Link>
                </div>

                {/* Indicateurs */}
                <div className="flex items-center gap-2">
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === slide ? 28 : 8,
                        background: i === slide ? sl.accent : 'rgba(255,255,255,0.25)',
                      }} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Grille photos catégories — masquée sur mobile */}
            <div className="hidden lg:grid grid-cols-2 gap-2">
              {categories.slice(0, 4).map((cat, i) => {
                const src = imgUrl(cat.image)
                return (
                  <div key={cat.id}
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    style={{ aspectRatio: '1', transition: 'transform .2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    {src
                      ? <img src={src} alt={cat.name}
                             className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"
                             style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <Package size={32} color="rgba(255,255,255,0.3)" />
                        </div>
                    }
                    <div className="absolute inset-0"
                         style={{ background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 50%)' }} />
                    <p className="absolute bottom-2.5 left-3 text-white text-xs font-bold">
                      {cat.name}
                    </p>
                  </div>
                )
              })}
            </div>

          </div>

          {/* ── Catégories en scroll horizontal (mobile only) ── */}
          {categories.length > 0 && (
            <div className="lg:hidden mt-5 pt-4 -mx-4 px-4 pb-1 flex gap-3 overflow-x-auto scrollbar-hide"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {categories.slice(0, 8).map(cat => {
                const src = imgUrl(cat.image)
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                    style={{ width: 60, textDecoration: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      overflow: 'hidden',
                      border: `1.5px solid ${sl.accent}55`,
                      background: `${sl.accent}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {src
                        ? <img src={src} alt={cat.name}
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Package size={20} color={sl.accent} />
                      }
                    </div>
                    <span className="line-clamp-2 text-center"
                          style={{ fontSize: 9, fontWeight: 600,
                                   color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
                      {cat.name}
                    </span>
                  </Link>
                )
              })}
              <Link to="/products"
                className="flex-shrink-0 flex flex-col items-center gap-1.5"
                style={{ width: 60, textDecoration: 'none' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  border: '1.5px dashed rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600,
                               color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                  Tout voir
                </span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          BARRE GARANTIES — fond blanc compact
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center overflow-x-auto scrollbar-hide divide-x divide-gray-100">
            {[
              { Icon: Shield, l: 'Paiement sécurisé',  c: '#16a34a' },
              { Icon: Truck,  l: 'Livraison suivie',   c: '#2563eb' },
              { Icon: Award,  l: 'Artisans certifiés', c: '#ea580c' },
              { Icon: Users,  l: 'Support Cameroun',   c: '#7c3aed' },
            ].map(({ Icon, l, c }) => (
              <div key={l} className="flex-shrink-0 flex items-center gap-2 px-5 py-3">
                <Icon size={14} style={{ color: c }} />
                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          GRILLE CATÉGORIES — style Amazon "Shop by category"
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <SectionHeader title="Acheter par catégorie" to="/products" />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {/* "Tout voir" */}
            <Link to="/products"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg
                         bg-orange-50 border border-orange-200 hover:bg-orange-100
                         hover:border-orange-400 transition-all text-center group">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package size={18} className="text-orange-500" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 leading-tight">
                Tout voir
              </span>
            </Link>
            {categories.slice(0, 17).map(cat => {
              const src = imgUrl(cat.image)
              return (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg
                             bg-gray-50 border border-gray-100 hover:bg-orange-50
                             hover:border-orange-300 transition-all text-center group">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-white
                                  border border-gray-100 flex items-center justify-center">
                    {src
                      ? <img src={src} alt={cat.name} className="w-full h-full object-cover" />
                      : <Package size={16} className="text-gray-300" />
                    }
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 leading-tight
                                   group-hover:text-orange-600 line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TENDANCES — carousel avec flèches
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <SectionHeader
            title="Tendances du moment"
            sub="Les produits les plus consultés"
            to="/products?ordering=-views_count" />
          <Carousel products={featured} loading={loadFeat} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          BANDEAU PROMO — ticker horizontal infini
      ══════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes promoTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .promo-ticker { animation: promoTicker 18s linear infinite; }
        .promo-ticker:hover { animation-play-state: paused; }
      `}</style>
      {/* Note: .promo-panel dimensions et responsive définis dans globals.css */}

      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
        <div style={{ borderRadius: 10, overflow: 'hidden' }}>
          <div className="promo-ticker" style={{ display: 'flex', width: 'max-content' }}>

            {[0, 1].map(copy => (
              <div key={copy} style={{ display: 'flex' }}>

                {/* Panneau 1 — Livraison gratuite */}
                <Link to="/register" className="promo-panel" style={{
                  background: '#1e3a5f',
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8,
                  borderRight: '2px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                   background: '#3b82f6', display: 'flex',
                                   alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={18} color="#fff" />
                    </div>
                    <p style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700,
                                 textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                      Offre découverte
                    </p>
                  </div>
                  <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 15, lineHeight: 1.3, margin: 0 }}>
                    Livraison gratuite sur votre 1ère commande
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
                    Code : <span style={{ color: '#f97316', fontWeight: 700 }}>SAHEL1</span> · nouveaux clients
                  </p>
                  <p style={{ color: '#93c5fd', fontSize: 12, fontWeight: 600, margin: 0 }}>
                    Créer un compte →
                  </p>
                </Link>

                {/* Panneau 2 — Paiements locaux */}
                <Link to="/products" className="promo-panel" style={{
                  background: '#1a2a1a',
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8,
                  borderRight: '2px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                   background: '#16a34a', display: 'flex',
                                   alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={18} color="#fff" />
                    </div>
                    <p style={{ color: '#86efac', fontSize: 10, fontWeight: 700,
                                 textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                      Paiement sécurisé
                    </p>
                  </div>
                  <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 15, lineHeight: 1.3, margin: 0 }}>
                    Orange Money · MTN Mobile Money
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
                    100% local et sécurisé. Aucune carte bancaire requise.
                  </p>
                  <p style={{ color: '#86efac', fontSize: 12, fontWeight: 600, margin: 0 }}>
                    Voir le catalogue →
                  </p>
                </Link>

                {/* Panneau 3 — Artisans */}
                <Link to="/register" className="promo-panel" style={{
                  background: '#2a1500',
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8,
                  borderRight: '2px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                   background: '#f97316', display: 'flex',
                                   alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={18} color="#fff" />
                    </div>
                    <p style={{ color: '#fdba74', fontSize: 10, fontWeight: 700,
                                 textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                      Vous êtes artisan ?
                    </p>
                  </div>
                  <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 15, lineHeight: 1.3, margin: 0 }}>
                    Vendez vos créations partout au Cameroun
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
                    Inscription gratuite. Un agent vous accompagne.
                  </p>
                  <p style={{ color: '#fdba74', fontSize: 12, fontWeight: 600, margin: 0 }}>
                    Rejoindre la plateforme →
                  </p>
                </Link>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          IMPACT — section chiffres-clés pour pitch investisseurs
      ══════════════════════════════════════════════════════════ */}
      {stats.artisans !== undefined && (
        <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
          <div className="rounded-2xl overflow-hidden relative"
               style={{ background: 'linear-gradient(135deg, #0f2027 0%, #1a3a2a 50%, #0f2027 100%)' }}>

            {/* Motif de fond subtil */}
            <div className="absolute inset-0 opacity-[0.04]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23fff'/%3E%3C/svg%3E")` }} />

            <div className="relative px-6 py-8 md:py-10">

              {/* Titre */}
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-bold
                                 uppercase tracking-widest mb-3"
                      style={{ background: 'rgba(249,115,22,0.15)',
                               color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
                  Notre impact
                </span>
                <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(20px,3vw,28px)',
                             color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  L'artisanat camerounais<br />
                  <span style={{ color: '#f97316' }}>en chiffres réels</span>
                </h2>
              </div>

              {/* Grille de stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
                {[
                  { v: stats.artisans,   l: 'Artisans soutenus',   sub: 'actifs sur la plateforme', Icon: Users,   accent: '#f97316', bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.25)'  },
                  { v: stats.produits,   l: 'Créations listées',   sub: 'faites à la main',         Icon: Package, accent: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   border: 'rgba(59,130,246,0.25)'  },
                  { v: stats.commandes || 0, l: 'Commandes livrées', sub: 'à travers le Cameroun',  Icon: Truck,   accent: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.25)'   },
                  { v: stats.regions,    l: 'Régions couvertes',   sub: 'sur 10 au Cameroun',       Icon: MapPin,  accent: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
                ].map(({ v, l, sub, Icon, accent, bg, border }) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: bg, border: `1px solid ${border}`,
                      borderRadius: 16, padding: '16px 20px',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, marginBottom: 10,
                      background: `${accent}22`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} style={{ color: accent }} />
                    </div>
                    <p style={{
                      fontFamily: 'Inter', fontWeight: 900, color: '#ffffff',
                      fontSize: 'clamp(24px,3.5vw,36px)', lineHeight: 1,
                      letterSpacing: '-0.03em', marginBottom: 4,
                    }}>
                      {Number(v).toLocaleString('fr-FR')}
                      <span style={{ color: accent, fontSize: '0.6em' }}>+</span>
                    </p>
                    <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13, marginBottom: 2 }}>
                      {l}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      {sub}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Note de bas */}
              <p className="text-center text-xs mt-6"
                 style={{ color: 'rgba(255,255,255,0.3)' }}>
                Données en temps réel · mise à jour automatique
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PARTENAIRES INSTITUTIONNELS
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold
                             uppercase tracking-widest bg-gray-100 text-gray-500 mb-2">
              Ils nous font confiance
            </span>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>
              Partenaires institutionnels
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sahel Market est soutenu par des acteurs majeurs du développement et du numérique au Cameroun
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                name: 'Orange Cameroun',
                role: 'Partenaire paiement mobile',
                color: '#ff6600',
                bg: '#fff7f0',
                border: '#ffe0cc',
                initial: 'O',
                desc: 'Orange Money',
              },
              {
                name: 'MTN Cameroun',
                role: 'Partenaire paiement MoMo',
                color: '#c8960a',
                bg: '#fffbea',
                border: '#fef08a',
                initial: 'M',
                desc: 'MTN MoMo',
              },
              {
                name: 'GIZ',
                role: 'Coopération au développement',
                color: '#4a7c3f',
                bg: '#f0f7ee',
                border: '#bbf0aa',
                initial: 'G',
                desc: 'Deutsche GIZ',
              },
              {
                name: 'MINCOMMERCE',
                role: 'Ministère du Commerce',
                color: '#1e3a8a',
                bg: '#eff6ff',
                border: '#bfdbfe',
                initial: 'MC',
                desc: 'Rép. du Cameroun',
              },
            ].map(({ name, role, color, bg, border, initial, desc }) => (
              <div key={name} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 14, padding: '18px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 10,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '-0.01em',
                  boxShadow: `0 4px 12px ${color}33`,
                }}>
                  {initial}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 2 }}>
                    {name}
                  </p>
                  <p style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 3 }}>{desc}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-gray-300 mt-5">
            Partenariats en cours de finalisation — données confidentielles
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          NOUVEAUX PRODUITS — grid 5 colonnes style Alibaba
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <SectionHeader
            title="Nouveaux produits"
            sub="Tout juste ajoutés par nos artisans"
            to="/products?ordering=-created_at" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {loadNew
              ? Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)
              : newProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTIONS PAR CATÉGORIE
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4 space-y-4">
        {categories.map(cat => <CatSection key={cat.id} category={cat} />)}
      </div>

      {/* ══════════════════════════════════════════════════════════
          CTA ARTISAN — style Amazon footer banner
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-4 mb-6">
        <div className="rounded-xl overflow-hidden px-8 py-10 text-center relative"
             style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2D6A4F 100%)' }}>
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23fff'/%3E%3C/svg%3E")` }} />
          <div className="relative">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold
                             uppercase tracking-widest mb-4"
                  style={{ background: 'rgba(255,255,255,0.1)',
                           color: '#86efac', border: '1px solid rgba(134,239,172,0.3)' }}>
              Pour les artisans
            </span>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 28,
                         color: '#ffffff', letterSpacing: '-0.02em' }}
                className="mb-3">
              Vendez vos créations au Cameroun et au-delà
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 480 }}
               className="mx-auto mb-8">
              Inscription gratuite. Un agent vous accompagne sur le terrain.
              Vos produits en ligne en moins de 48h.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold
                           text-sm text-white transition-all hover:opacity-90
                           hover:-translate-y-0.5"
                style={{ background: '#f97316' }}>
                Créer mon compte gratuit <ArrowRight size={15} />
              </Link>
              <Link to="/how-it-works"
                className="inline-flex items-center px-8 py-3.5 rounded-lg font-semibold
                           text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)',
                         border: '1px solid rgba(255,255,255,0.2)',
                         color: '#ffffff' }}>
                Comment ça marche ?
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
