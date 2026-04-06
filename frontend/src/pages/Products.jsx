import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, SlidersHorizontal, ChevronRight,
  ArrowUpDown, PackageX
} from 'lucide-react'
import { productService } from '../services/product.service.js'
import { setFilters, setPage } from '../store/productSlice.js'
import ProductCard from '../components/ProductCard.jsx'

const API = 'http://localhost:8000'
function imgUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API}${path}`
}

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

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2 bg-gray-100 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-4 bg-gray-100 rounded-full w-1/3" />
          <div className="w-9 h-9 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: '-created_at',  label: 'Plus récents' },
  { value: 'price',        label: 'Prix croissant' },
  { value: '-price',       label: 'Prix décroissant' },
  { value: '-views_count', label: 'Populaires' },
]

export default function Products() {
  const dispatch = useDispatch()
  const [searchParams]   = useSearchParams()
  const { filters, currentPage } = useSelector(s => s.product)
  const [search,    setSearch]   = useState(filters.search || '')
  const [sortOpen,  setSortOpen] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    const cat = searchParams.get('category')
    const q   = searchParams.get('q')
    if (cat) dispatch(setFilters({ category: cat }))
    if (q)   { dispatch(setFilters({ search: q })); setSearch(q) }
  }, [])

  useEffect(() => {
    function handle(e) {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => productService.getCategories(),
  })
  const categories = Array.isArray(catsData?.data)
    ? catsData.data
    : Array.isArray(catsData?.data?.results)
      ? catsData.data.results
      : []

  const qParams = {
    search:   filters.search   || undefined,
    category: filters.category || undefined,
    ordering: filters.ordering || '-created_at',
    page:     currentPage,
  }
  const { data, isLoading } = useQuery({
    queryKey: ['products', qParams],
    queryFn:  () => productService.getAll(qParams),
    keepPreviousData: true,
  })

  const products   = data?.data?.results || []
  const total      = data?.data?.count   || 0
  const totalPages = Math.ceil(total / 20)

  const activeCategory = categories.find(
    c => String(c.id) === String(filters.category)
  )
  const activeSort = SORT_OPTIONS.find(
    o => o.value === (filters.ordering || '-created_at')
  )

  const selectCategory = (id) => {
    dispatch(setFilters({ category: id }))
    dispatch(setPage(1))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search }))
    dispatch(setPage(1))
  }

  const clearAll = () => {
    dispatch(setFilters({ category: '', search: '' }))
    setSearch('')
    dispatch(setPage(1))
  }

  const hasFilters = filters.category || filters.search

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════════════════════════
          BARRE STICKY — recherche + catégories
      ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Ligne recherche + tri */}
          <div className="flex items-center gap-3 py-3">
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative flex items-center">
                <Search
                  size={15}
                  className="absolute left-3.5 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={
                    activeCategory
                      ? `Rechercher dans ${activeCategory.name}...`
                      : 'Rechercher un produit artisanal...'
                  }
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200
                             rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200
                             focus:border-orange-400 focus:bg-white transition-all placeholder-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      dispatch(setFilters({ search: '' }))
                      dispatch(setPage(1))
                    }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Tri — dropdown custom */}
            <div className="relative flex-shrink-0" ref={sortRef}>
              <button
                onClick={() => setSortOpen(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                            rounded-xl border transition-all duration-150
                            ${sortOpen
                              ? 'bg-orange-50 border-orange-300 text-orange-600'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300'
                            }`}
              >
                <ArrowUpDown size={14} />
                <span className="hidden sm:inline">{activeSort?.label}</span>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl
                               shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          dispatch(setFilters({ ordering: opt.value }))
                          dispatch(setPage(1))
                          setSortOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors
                                    ${filters.ordering === opt.value
                                      ? 'bg-orange-50 text-orange-600 font-semibold'
                                      : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                      >
                        {opt.value === (filters.ordering || '-created_at') && (
                          <span className="mr-2">✓</span>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Onglets catégories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">

            {/* Tout */}
            <button
              onClick={() => selectCategory('')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl
                          text-xs font-bold transition-all duration-150 border
                          ${!filters.category
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
                          }`}
            >
              <span className="text-sm">🛍️</span> Tout
            </button>

            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

            {categories.map(cat => {
              const isActive = String(filters.category) === String(cat.id)
              const src = imgUrl(cat.image)

              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(String(cat.id))}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl
                              text-xs font-bold transition-all duration-150 border whitespace-nowrap
                              ${isActive
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
                              }`}
                >
                  <div className={`w-5 h-5 rounded-full overflow-hidden flex-shrink-0
                                   flex items-center justify-center
                                   ${isActive ? 'ring-2 ring-white/50' : ''}`}
                    style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '#f5f0eb' }}
                  >
                    {src
                      ? <img src={src} alt={cat.name} className="w-full h-full object-cover" />
                      : <span style={{ fontSize: 11 }}>{catEmoji(cat.name)}</span>
                    }
                  </div>
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HEADER RÉSULTATS
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4">

          {/* Breadcrumb + titre */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
              <span>Boutique</span>
              {activeCategory && (
                <>
                  <ChevronRight size={11} />
                  <span className="text-orange-500 font-semibold">{activeCategory.name}</span>
                </>
              )}
              {filters.search && (
                <>
                  <ChevronRight size={11} />
                  <span className="text-gray-600 font-medium">"{filters.search}"</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeCategory?.image && (
                <img
                  src={imgUrl(activeCategory.image)}
                  alt={activeCategory.name}
                  className="w-9 h-9 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
                />
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {filters.search
                    ? `"${filters.search}"`
                    : activeCategory?.name || 'Tous les produits'}
                </h1>
                {!isLoading && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Effacer filtres */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold
                         text-gray-500 hover:text-red-500 border border-gray-200
                         hover:border-red-200 bg-white px-3 py-2 rounded-xl
                         transition-all duration-150"
            >
              <X size={12} /> Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          GRILLE PRODUITS
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}
          </div>

        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center
                            justify-center mb-5">
              <PackageX size={36} strokeWidth={1} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
              {activeCategory
                ? `Pas encore de produits dans la catégorie "${activeCategory.name}".`
                : 'Essaie avec d\'autres mots-clés ou une autre catégorie.'}
            </p>
            <button
              onClick={clearAll}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold
                         rounded-xl hover:bg-orange-600 transition-colors shadow-md
                         shadow-orange-200"
            >
              Voir tous les produits
            </button>
          </motion.div>

        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.category}-${filters.search}-${currentPage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
            >
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => dispatch(setPage(currentPage - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200
                         rounded-xl disabled:opacity-40 hover:border-orange-300
                         hover:text-orange-500 transition-all disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p =>
                  p === 1 || p === totalPages ||
                  Math.abs(p - currentPage) <= 1
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`dot-${i}`} className="w-9 text-center text-gray-400 text-sm">…</span>
                    : <button
                        key={p}
                        onClick={() => dispatch(setPage(p))}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                                    ${currentPage === p
                                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                      : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                    }`}
                      >
                        {p}
                      </button>
                )
              }
            </div>

            <button
              onClick={() => dispatch(setPage(currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200
                         rounded-xl disabled:opacity-40 hover:border-orange-300
                         hover:text-orange-500 transition-all disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}