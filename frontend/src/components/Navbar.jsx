import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Menu, X, Search, ChevronDown, Package
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleCart } from '../store/cartSlice.js'
import { logout } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'
import toast from 'react-hot-toast'

const API = 'http://localhost:8000'
function imgUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API}${path}`
}

const ROLE_LABELS = {
  admin:    { label: 'Administrateur', color: 'bg-red-100 text-red-700' },
  agent:    { label: 'Agent',          color: 'bg-blue-100 text-blue-700' },
  producer: { label: 'Artisan',        color: 'bg-green-100 text-green-700' },
  client:   { label: 'Client',         color: 'bg-orange-100 text-orange-700' },
}

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const { itemCount, total }      = useSelector(s => s.cart)

  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef = useRef(null)

  const dashboardPath = {
    admin:    '/dashboard/admin',
    agent:    '/dashboard/agent',
    producer: '/dashboard/producer',
  }[user?.role]

  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.client

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setUserDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserDropdown(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try { await authService.logout('') } catch {}
    dispatch(logout())
    navigate('/')
    toast.success('Déconnecté avec succès')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">

      {/* ════════════════════════ BARRE PRINCIPALE ══════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600
                            rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white font-black text-base font-display leading-none">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-display font-black text-gray-900 tracking-tight">
                Sahel<span className="text-orange-500">Market</span>
              </span>
            </div>
          </Link>

          {/* ── Barre de recherche (desktop) ─────────────────────────── */}
          <form onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-2xl">
            <div className={`flex w-full rounded-2xl overflow-hidden border-2 transition-all duration-200
                            ${searchFocused
                              ? 'border-orange-400 shadow-lg shadow-orange-100'
                              : 'border-gray-100 hover:border-gray-200'}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Rechercher un produit artisanal..."
                className="flex-1 px-5 py-3 text-sm outline-none bg-gray-50
                           text-gray-800 placeholder-gray-400 font-body"
              />
              <button type="submit"
                className="px-5 bg-orange-500 hover:bg-orange-600 transition-colors
                           flex items-center justify-center group">
                <Search size={18} className="text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </form>

          {/* ── Actions droite ───────────────────────────────────────── */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Panier */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative flex items-center gap-2 px-3 py-2 rounded-2xl
                         hover:bg-orange-50 transition-all duration-150 group"
            >
              <div className="relative">
                <ShoppingBag
                  size={22}
                  className="text-gray-600 group-hover:text-orange-500 transition-colors"
                />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white
                                 text-[10px] font-black min-w-[18px] h-[18px] px-1
                                 rounded-full flex items-center justify-center leading-none"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] text-gray-400 leading-none font-body">Mon panier</p>
                <p className="text-xs font-bold text-gray-800 leading-none mt-0.5">
                  {itemCount > 0
                    ? `${Number(total).toLocaleString('fr-FR')} FCFA`
                    : 'Vide'}
                </p>
              </div>
            </button>

            {/* ── Connecté : avatar + dropdown ─────────────────────── */}
            {isAuthenticated ? (
              <>
                {/* Desktop dropdown */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdown(v => !v)}
                    className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl
                                transition-all duration-150
                                ${userDropdown ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-100'}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0
                                    ring-2 ring-orange-200 ring-offset-1">
                      {user?.avatar
                        ? <img src={imgUrl(user.avatar)} alt=""
                               className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600
                                          flex items-center justify-center">
                            <span className="text-white font-black text-sm">
                              {user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                      }
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 leading-none">
                        {user?.first_name || user?.username}
                      </p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5
                                       rounded-full ${roleInfo.color} leading-none mt-0.5 inline-block`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200
                                  ${userDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl
                                   shadow-2xl shadow-gray-200/80 border border-gray-100
                                   overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50
                                        border-b border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-200">
                              {user?.avatar
                                ? <img src={imgUrl(user.avatar)} alt=""
                                       className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-orange-400
                                                  to-orange-600 flex items-center justify-center">
                                    <span className="text-white font-black">
                                      {user?.username?.[0]?.toUpperCase()}
                                    </span>
                                  </div>
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {user?.first_name
                                  ? `${user.first_name} ${user.last_name || ''}`
                                  : user?.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="py-2">
                          {[
                            { to: '/profile', icon: User,            label: 'Mon profil' },
                            { to: '/orders',  icon: Package,         label: 'Mes commandes' },
                            ...(dashboardPath
                              ? [{ to: dashboardPath, icon: LayoutDashboard, label: 'Tableau de bord' }]
                              : []),
                          ].map(({ to, icon: Icon, label }) => (
                            <Link key={to} to={to}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                                         hover:bg-orange-50 hover:text-orange-600 transition-colors group">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-orange-100
                                              flex items-center justify-center transition-colors">
                                <Icon size={14} className="text-gray-500 group-hover:text-orange-500" />
                              </div>
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-red-500 hover:bg-red-50 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-red-100
                                            flex items-center justify-center transition-colors">
                              <LogOut size={14} className="text-gray-500 group-hover:text-red-500" />
                            </div>
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Non connecté */
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700
                             hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                  Connexion
                </Link>
                <Link to="/register"
                  className="px-5 py-2 text-sm font-bold text-white bg-orange-500
                             rounded-xl hover:bg-orange-600 transition-all duration-150
                             shadow-md shadow-orange-200 hover:shadow-orange-300">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors ml-1"
            >
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.div key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}>
                      <X size={21} className="text-gray-700" />
                    </motion.div>
                  : <motion.div key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}>
                      <Menu size={21} className="text-gray-700" />
                    </motion.div>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════ MENU MOBILE ═══════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-100 overflow-hidden bg-white"
          >
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="flex gap-2 px-4 pt-4 pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl
                           outline-none focus:border-orange-400 bg-gray-50 transition-colors"
              />
              <button type="submit"
                className="px-4 py-3 bg-orange-500 text-white rounded-xl
                           hover:bg-orange-600 transition-colors">
                <Search size={16} />
              </button>
            </form>

            {/* Profil mobile */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 mx-4 mb-2 p-3
                              bg-orange-50 rounded-2xl border border-orange-100">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-200 flex-shrink-0">
                  {user?.avatar
                    ? <img src={imgUrl(user.avatar)} alt=""
                           className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600
                                      flex items-center justify-center">
                        <span className="text-white font-black">
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{user?.username}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Liens */}
            <div className="px-4 pb-4 space-y-0.5">
              {[
                { to: '/products', icon: ShoppingBag, label: 'Catalogue' },
                ...(isAuthenticated ? [
                  { to: '/orders',      icon: Package,         label: 'Mes commandes' },
                  { to: '/profile',     icon: User,            label: 'Mon profil' },
                  ...(dashboardPath
                    ? [{ to: dashboardPath, icon: LayoutDashboard, label: 'Tableau de bord' }]
                    : []),
                ] : []),
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm
                             font-semibold text-gray-700 hover:bg-orange-50
                             hover:text-orange-600 transition-colors">
                  <Icon size={17} className="text-gray-400" /> {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                             text-sm font-semibold text-red-500 hover:bg-red-50
                             transition-colors mt-2 border-t border-gray-100 pt-3">
                  <LogOut size={17} /> Déconnexion
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-100">
                  <Link to="/login"
                    className="flex items-center justify-center py-3 rounded-2xl text-sm
                               font-bold border-2 border-orange-500 text-orange-500
                               hover:bg-orange-50 transition-colors">
                    Connexion
                  </Link>
                  <Link to="/register"
                    className="flex items-center justify-center py-3 rounded-2xl text-sm
                               font-bold bg-orange-500 text-white hover:bg-orange-600
                               transition-colors shadow-md shadow-orange-200">
                    S'inscrire gratuitement
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}