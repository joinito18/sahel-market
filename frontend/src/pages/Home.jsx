import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import {
  ArrowRight, Star, Shield, Truck, ShoppingCart,
  Heart, MapPin, Zap, Award, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { productService } from '../services/product.service.js'
import { addItem, openCart } from '../store/cartSlice.js'
import SearchBar from '../components/SearchBar.jsx'
import toast from 'react-hot-toast'

const API = 'http://localhost:8000'
function imgUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API}${path}`
}
const FCFA = (n) => Number(n).toLocaleString('fr-FR') + ' FCFA'

function catEmoji(name = '') {
  const n = name.toLowerCase()
  if (n.includes('maroquin') || n.includes('cuir'))   return '👜'
  if (n.includes('tissu')    || n.includes('pagne'))   return '🧵'
  if (n.includes('poter')    || n.includes('canari'))  return '🏺'
  if (n.includes('bijou')    || n.includes('collier')) return '💎'
  if (n.includes('vannier')  || n.includes('panier'))  return '🧺'
  if (n.includes('salon'))                             return '🛋️'
  return '📦'
}

function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const [imgError, setImgError] = useState(false)
  const [liked,    setLiked]    = useState(false)
  const src = imgUrl(product.main_image)

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    dispatch(addItem(product))
    dispatch(openCart())
    toast.success('Ajouté au panier !')
  }

  const handleLike = (e) => {
    e.preventDefault(); e.stopPropagation()
    setLiked(l => !l)
    toast.success(liked ? 'Retiré des favoris' : 'Ajouté aux favoris')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
    >
      <Link
        to={`/products/${product.id}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100
                   hover:shadow-xl hover:border-orange-100 transition-all duration-200"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          {src && !imgError ? (
            <img src={src} alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <span style={{ fontSize: 44 }}>{catEmoji('')}</span>
              <span className="text-xs text-gray-300 mt-1">Pas de photo</span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                Rupture de stock
              </span>
            </div>
          )}

          {product.views_count > 100 && product.stock > 0 && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5
                               rounded-full flex items-center gap-0.5">
                <Zap size={9} fill="white" /> Populaire
              </span>
            </div>
          )}

          <button onClick={handleLike}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center
                        justify-center shadow-md transition-all duration-200
                        ${liked
                          ? 'bg-red-500 opacity-100'
                          : 'bg-white/90 opacity-0 group-hover:opacity-100'}`}>
            <Heart size={14} className={liked ? 'fill-white text-white' : 'text-gray-500'} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 translate-y-full
                          group-hover:translate-y-0 transition-transform duration-200">
            <button onClick={handleCart} disabled={product.stock === 0}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs
                         font-semibold flex items-center justify-center gap-1.5
                         disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              <ShoppingCart size={13} /> Ajouter au panier
            </button>
          </div>
        </div>

        <div className="p-3.5">
          {product.location && (
            <div className="flex items-center gap-1 text-gray-400 text-[11px] mb-1">
              <MapPin size={9} /><span>{product.location}</span>
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2
                         group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.average_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10}
                  className={s <= Math.round(product.average_rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'} />
              ))}
              <span className="text-[11px] text-gray-400 ml-0.5">({product.average_rating})</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-1">
            <div>
              <span className="font-bold text-orange-600 text-base">{FCFA(product.price)}</span>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-[10px] text-red-500 font-medium mt-0.5">
                  Plus que {product.stock} en stock !
                </p>
              )}
            </div>
            <button onClick={handleCart} disabled={product.stock === 0}
              className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200
                         text-white rounded-xl flex items-center justify-center
                         transition-colors disabled:cursor-not-allowed shadow-sm">
              <ShoppingCart size={13} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
        <div className="h-4 bg-gray-100 rounded w-2/5 mt-1" />
      </div>
    </div>
  )
}

export default function Home() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  () => productService.getAll({ ordering: '-views_count', page_size: 8 }),
  })
  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => productService.getCategories(),
  })

  const products = productsData?.data?.results || []
  const categories = Array.isArray(catsData?.data)
    ? catsData.data
    : Array.isArray(catsData?.data?.results)
      ? catsData.data.results : []

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1a2e1f 50%, #2D6A4F 100%)' }}>

        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8732A' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C8732A, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2D6A4F, transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border
                              border-orange-500/20 text-orange-400 text-xs font-semibold
                              tracking-wider uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                Artisanat authentique du Sahel
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold
                             text-white leading-[1.1] mb-6">
                L'artisanat du<br />
                <span className="text-transparent"
                      style={{ WebkitTextStroke: '1px #F4A261' }}>
                  Sahel
                </span><br />
                <span className="text-orange-400">à portée de clic</span>
              </h1>

              <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                Des produits authentiques fabriqués à la main par les artisans
                du Sahel. Livraison rapide, paiement sécurisé en FCFA.
              </p>

              <div className="max-w-md mb-8">
                <SearchBar placeholder="Sac en cuir, poterie, bijoux..." />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500
                             text-white font-semibold rounded-xl hover:bg-orange-600
                             transition-all hover:gap-3 text-sm shadow-lg shadow-orange-500/20">
                  Explorer le catalogue <ArrowRight size={16} />
                </Link>
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5
                             border border-white/20 text-white font-semibold rounded-xl
                             hover:bg-white/10 transition-colors text-sm">
                  Devenir vendeur
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/10">
                {[
                  ['600+', 'Artisans actifs'],
                  ['4 900+', 'Produits'],
                  ['5 régions', 'Couvertes'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-xl font-bold text-white font-display">{val}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-3"
            >
              {categories.slice(0, 4).map((cat, i) => {
                const src = imgUrl(cat.image)
                return (
                  <motion.div key={cat.id} whileHover={{ scale: 1.03 }}
                    className="relative overflow-hidden rounded-2xl aspect-square"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {src
                      ? <img src={src} alt={cat.name}
                             className="w-full h-full object-cover opacity-80" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">
                          {catEmoji(cat.name)}
                        </div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white text-sm font-semibold">{cat.name}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { icon: Shield, title: 'Paiement 100% sécurisé', desc: 'CinetPay · Orange Money · MTN MoMo', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: Truck,  title: 'Livraison rapide',        desc: 'Suivi GPS en temps réel',            color: 'text-blue-600',  bg: 'bg-blue-50'  },
              { icon: Award,  title: 'Artisans vérifiés',       desc: 'Certifiés par nos agents terrain',   color: 'text-orange-500',bg: 'bg-orange-50'},
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={19} className={color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CATÉGORIES
      ══════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-gray-900">Catégories</h2>
              <Link to="/products"
                className="text-sm text-orange-500 font-medium flex items-center gap-0.5 hover:underline">
                Tout voir <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {categories.map((cat, i) => {
                const src = imgUrl(cat.image)
                return (
                  <motion.div key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link to={`/products?category=${cat.id}`}
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl
                                 hover:bg-orange-50 border border-transparent
                                 hover:border-orange-100 transition-all duration-200 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden
                                      bg-gradient-to-br from-amber-50 to-orange-50
                                      ring-2 ring-transparent group-hover:ring-orange-300
                                      transition-all duration-200 flex-shrink-0 shadow-sm">
                        {src
                          ? <img src={src} alt={cat.name}
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">
                              {catEmoji(cat.name)}
                            </div>
                        }
                      </div>
                      <span className="text-xs font-semibold text-gray-700
                                       group-hover:text-orange-600 transition-colors leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BANDEAU PROMO
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-4 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Zap size={18} fill="white" />
              <span className="font-semibold text-sm">
                Livraison offerte dès 25 000 FCFA d'achat
              </span>
            </div>
            <Link to="/products"
              className="text-white/80 text-sm flex items-center gap-1
                         hover:text-white transition-colors font-medium">
              En profiter <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRODUITS POPULAIRES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900">
                Produits populaires
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Les plus consultés cette semaine</p>
            </div>
            <Link to="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm text-orange-500
                         font-semibold hover:underline">
              Voir tout <ChevronRight size={15} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Aucun produit pour l'instant</p>
              <p className="text-sm mt-1">Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500
                         text-white text-sm font-semibold rounded-xl hover:bg-orange-600">
              Voir tous les produits <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA ARTISAN — pleine largeur, sans référence Extrême-Nord
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2e1f 0%, #2D6A4F 100%)' }}>

        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F4A261, transparent)' }} />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2D6A4F, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Texte gauche */}
            <div className="text-center lg:text-left max-w-2xl">
              <span className="inline-block bg-green-400/20 text-green-300 text-xs font-bold
                               tracking-widest uppercase px-4 py-1.5 rounded-full mb-5
                               border border-green-400/20">
                Rejoignez-nous
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white
                             leading-snug mb-4">
                Vous êtes artisan du Sahel ?
              </h2>
              <p className="text-green-100/80 text-base leading-relaxed max-w-xl">
                Accédez à des milliers d'acheteurs à travers le pays et vendez
                vos créations au juste prix. Inscription gratuite,
                accompagnement personnalisé par nos agents terrain.
              </p>

              <div className="flex flex-wrap gap-8 mt-8 justify-center lg:justify-start">
                {[
                  ['600+',   'Artisans inscrits'],
                  ['4 900+', 'Produits vendus'  ],
                  ['100%',   'Gratuit'           ],
                ].map(([val, label]) => (
                  <div key={label} className="text-center lg:text-left">
                    <p className="text-2xl font-black text-white font-display">{val}</p>
                    <p className="text-green-300/70 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte étapes droite */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20
                              rounded-3xl p-8 w-full lg:w-80">
                <h3 className="text-white font-bold text-lg mb-6 font-display">
                  Commencer en 3 étapes
                </h3>
                <div className="space-y-4 mb-8">
                  {[
                    { n: '1', label: 'Créez votre compte gratuitement' },
                    { n: '2', label: 'Un agent vous contacte sous 48h'  },
                    { n: '3', label: 'Vos produits sont en ligne'       },
                  ].map(({ n, label }) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center
                                      justify-center flex-shrink-0 shadow-md shadow-orange-900/30">
                        <span className="text-white text-xs font-black">{n}</span>
                      </div>
                      <span className="text-green-100 text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/register"
                    className="flex items-center justify-center gap-2 py-3.5 bg-orange-500
                               hover:bg-orange-600 text-white font-bold rounded-2xl
                               transition-all duration-150 shadow-lg shadow-orange-900/30
                               hover:-translate-y-0.5 text-sm">
                    S'inscrire gratuitement <ArrowRight size={16} />
                  </Link>
                  <Link to="/products"
                    className="flex items-center justify-center py-3 border border-white/20
                               text-white/70 hover:text-white hover:bg-white/5 text-sm
                               font-medium rounded-2xl transition-colors">
                    Voir la plateforme
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}