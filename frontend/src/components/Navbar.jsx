import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Menu, X, Search, ChevronDown, Package, Grid3x3, Store, Heart,
  Bell, CheckCheck, ShoppingCart, MessageCircle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleCart } from '../store/cartSlice.js'
import { logout } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'
import { productService } from '../services/product.service.js'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { imgUrl } from '../utils/media.js'

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

  const [menuOpen,      setMenuOpen]      = useState(false)
  const [userDropdown,  setUserDropdown]  = useState(false)
  const [catOpen,       setCatOpen]       = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef = useRef(null)
  const catRef      = useRef(null)
  const notifRef    = useRef(null)
  const qc          = useQueryClient()

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/orders/notifications/').then(r => r.data),
    enabled:  isAuthenticated,
    refetchInterval: 30000,
  })
  const notifications = notifData?.results ?? []
  const unread        = notifData?.unread ?? 0

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/orders/notifications/'),
    onSuccess:  () => qc.invalidateQueries(['notifications']),
  })

  const dashboardPath = {
    admin:    '/dashboard/admin',
    agent:    '/dashboard/agent',
    producer: '/dashboard/producer',
  }[user?.role]

  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.client

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => productService.getCategories(),
    staleTime: 5 * 60 * 1000,
  })
  const categories = Array.isArray(catsData?.data)
    ? catsData.data
    : Array.isArray(catsData?.data?.results)
      ? catsData.data.results
      : []

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setUserDropdown(false)
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserDropdown(false)
    setCatOpen(false)
    setNotifOpen(false)
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
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 h-16">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-1">
            <div style={{
              width: 36, height: 36, background: '#f97316',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>S</span>
            </div>
            <div className="hidden sm:block">
              <span style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                Sahel<span style={{ color: '#f97316' }}>Market</span>
              </span>
            </div>
          </Link>

          {/* ── Catégories dropdown ──────────────────────────────────── */}
          <div className="relative hidden lg:block flex-shrink-0" ref={catRef}>
            <button
              onClick={() => setCatOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                color: catOpen ? '#f97316' : '#374151',
                background: catOpen ? '#fff7ed' : 'transparent',
                border: catOpen ? '1px solid #fed7aa' : '1px solid transparent',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <Grid3x3 size={15} />
              Catégories
              <ChevronDown size={13} style={{
                transition: 'transform .2s',
                transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    width: 480, background: '#fff', borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6',
                    zIndex: 60, overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div style={{
                    padding: '14px 18px 10px', background: 'linear-gradient(135deg,#fff7ed,#fff)',
                    borderBottom: '1px solid #fed7aa22',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#f97316',
                                 textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Nos collections
                    </p>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      {categories.length} catégories d'artisanat authentique
                    </p>
                  </div>

                  {/* Grid catégories */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 1, background: '#f9fafb', padding: 1,
                  }}>
                    {categories.map(cat => {
                      const src = imgUrl(cat.image)
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', background: '#fff',
                            textDecoration: 'none', transition: 'background .12s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
                            flexShrink: 0, background: '#f5f0eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {src
                              ? <img src={src} alt={cat.name}
                                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Package size={18} color="#d1d5db" />
                            }
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1,
                                           overflow: 'hidden', whiteSpace: 'nowrap',
                                           textOverflow: 'ellipsis', maxWidth: 160 }}>
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Tout voir */}
                  <Link
                    to="/products"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '12px', fontSize: 12, fontWeight: 700,
                      color: '#f97316', textDecoration: 'none',
                      borderTop: '1px solid #f3f4f6', background: '#fff',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Voir tout le catalogue →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Barre de recherche (desktop) ─────────────────────────── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div style={{
              display: 'flex', width: '100%', borderRadius: 12, overflow: 'hidden',
              border: `2px solid ${searchFocused ? '#f97316' : '#e5e7eb'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(249,115,22,0.1)' : 'none',
              transition: 'all .2s',
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Rechercher un produit artisanal..."
                style={{
                  flex: 1, padding: '10px 16px', fontSize: 13, outline: 'none',
                  background: '#f9fafb', color: '#111827', border: 'none',
                }}
              />
              <button type="submit" style={{
                padding: '0 18px', background: '#f97316', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Search size={17} color="#fff" />
              </button>
            </div>
          </form>

          {/* ── Actions droite ───────────────────────────────────────── */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Favoris — masqué sur xs, visible à partir de sm */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="hidden sm:flex"
                style={{ alignItems: 'center', gap: 6,
                          padding: '7px 10px', borderRadius: 10,
                          background: 'transparent', transition: 'background .15s',
                          textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Heart size={22} color="#ef4444" />
                <span className="hidden lg:block" style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>
                  Favoris
                </span>
              </Link>
            )}

            {/* Cloche notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(v => !v); if (!notifOpen && unread > 0) markAllRead.mutate() }}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center',
                    padding: '7px 10px', borderRadius: 10, background: 'transparent',
                    border: 'none', cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Bell size={22} color={unread > 0 ? '#f97316' : '#374151'} />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2,
                      background: '#ef4444', color: '#fff',
                      fontSize: 9, fontWeight: 900,
                      minWidth: 16, height: 16, padding: '0 3px',
                      borderRadius: 8, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', lineHeight: 1,
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="notif-dropdown"
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: 340, background: '#fff', borderRadius: 16,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                        border: '1px solid #f3f4f6', overflow: 'hidden', zIndex: 60,
                      }}
                    >
                      <div style={{
                        padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                          Notifications
                        </p>
                        {unread === 0 && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            <CheckCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                            Tout lu
                          </span>
                        )}
                      </div>

                      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                            <Bell size={32} color="#e5e7eb" style={{ margin: '0 auto 8px' }} />
                            <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune notification</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <Link
                              key={n.id}
                              to={n.order_id ? `/orders` : '#'}
                              style={{
                                display: 'flex', gap: 12, padding: '12px 16px',
                                textDecoration: 'none', borderBottom: '1px solid #f9fafb',
                                background: n.is_read ? '#fff' : '#fff7ed',
                                transition: 'background .12s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                              onMouseLeave={e => e.currentTarget.style.background = n.is_read ? '#fff' : '#fff7ed'}
                            >
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: n.is_read ? '#f3f4f6' : '#fff7ed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <ShoppingCart size={16} color={n.is_read ? '#9ca3af' : '#f97316'} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 12, fontWeight: n.is_read ? 500 : 700,
                                  color: '#111827', marginBottom: 2,
                                }}>
                                  {n.title}
                                </p>
                                <p style={{
                                  fontSize: 11, color: '#6b7280', lineHeight: 1.4,
                                  overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                  {n.message}
                                </p>
                                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                                  {new Date(n.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!n.is_read && (
                                <div style={{
                                  width: 7, height: 7, borderRadius: '50%',
                                  background: '#f97316', flexShrink: 0, marginTop: 4,
                                }} />
                              )}
                            </Link>
                          ))
                        )}
                      </div>

                      <Link to="/orders" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '10px', fontSize: 12, fontWeight: 700, color: '#f97316',
                        textDecoration: 'none', borderTop: '1px solid #f3f4f6',
                        background: '#fff', transition: 'background .12s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        Voir mes commandes →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Messages — masqué sur xs, visible à partir de sm */}
            {isAuthenticated && (
              <Link
                to="/messages"
                className="hidden sm:flex"
                style={{
                  alignItems: 'center',
                  padding: '7px 10px', borderRadius: 10,
                  background: 'transparent', textDecoration: 'none', transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <MessageCircle size={22} color="#3b82f6" />
              </Link>
            )}

            {/* Panier — masqué sur mobile (BottomNav le gère) */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="hidden md:flex"
              style={{ alignItems: 'center', gap: 8,
                        padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
                        background: 'transparent', border: 'none', transition: 'background .15s',
                        position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={22} color="#374151" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      style={{
                        position: 'absolute', top: -8, right: -8,
                        background: '#f97316', color: '#fff',
                        fontSize: 10, fontWeight: 900,
                        minWidth: 18, height: 18, padding: '0 4px',
                        borderRadius: 9, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', lineHeight: 1,
                      }}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden lg:block" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1 }}>Mon panier</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1, marginTop: 2 }}>
                  {itemCount > 0
                    ? `${Number(total).toLocaleString('fr-FR')} FCFA`
                    : 'Vide'}
                </p>
              </div>
            </button>

            {/* ── Connecté : avatar + dropdown ─────────────────────── */}
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px 6px 6px', borderRadius: 10, cursor: 'pointer',
                    background: userDropdown ? '#fff7ed' : 'transparent',
                    border: userDropdown ? '1px solid #fed7aa' : '1px solid transparent',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                    flexShrink: 0, outline: '2px solid #fed7aa', outlineOffset: 1,
                  }}>
                    {user?.avatar
                      ? <img src={imgUrl(user.avatar)} alt=""
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg,#fb923c,#ea580c)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                    }
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                      {user?.first_name || user?.username}
                    </p>
                    <p style={{
                      fontSize: 10, fontWeight: 600, lineHeight: 1, marginTop: 2,
                      padding: '1px 6px', borderRadius: 4, display: 'inline-block',
                      ...(user?.role === 'producer'
                        ? { background: '#dcfce7', color: '#15803d' }
                        : user?.role === 'admin'
                          ? { background: '#fee2e2', color: '#dc2626' }
                          : { background: '#fff7ed', color: '#ea580c' })
                    }}>
                      {roleInfo.label}
                    </p>
                  </div>
                  <ChevronDown size={13} color="#9ca3af" style={{
                    transition: 'transform .2s',
                    transform: userDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: 240, background: '#fff', borderRadius: 16,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6',
                        overflow: 'hidden', zIndex: 60,
                      }}
                    >
                      <div style={{
                        padding: '14px 16px', background: 'linear-gradient(135deg,#fff7ed,#fff)',
                        borderBottom: '1px solid #f3f4f6',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
                            outline: '2px solid #fed7aa', flexShrink: 0,
                          }}>
                            {user?.avatar
                              ? <img src={imgUrl(user.avatar)} alt=""
                                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{
                                  width: '100%', height: '100%',
                                  background: 'linear-gradient(135deg,#fb923c,#ea580c)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <span style={{ color: '#fff', fontWeight: 900 }}>
                                    {user?.username?.[0]?.toUpperCase()}
                                  </span>
                                </div>
                            }
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827',
                                         overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                            </p>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1,
                                         overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '6px 0' }}>
                        {[
                          { to: '/profile', icon: User,            label: 'Mon profil' },
                          { to: '/orders',  icon: Package,         label: 'Mes commandes' },
                          ...(dashboardPath
                            ? [{ to: dashboardPath, icon: LayoutDashboard, label: 'Tableau de bord' }]
                            : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 16px', fontSize: 13, color: '#374151',
                              textDecoration: 'none', transition: 'background .12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#f97316' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}
                          >
                            <div style={{
                              width: 28, height: 28, borderRadius: 8, background: '#f3f4f6',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon size={14} color="#6b7280" />
                            </div>
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid #f3f4f6', padding: '6px 0' }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 16px', fontSize: 13, color: '#ef4444',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            transition: 'background .12s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, background: '#fee2e2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <LogOut size={14} color="#ef4444" />
                          </div>
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    color: '#374151', textDecoration: 'none', borderRadius: 10,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.background = '#fff7ed' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'transparent' }}
                >
                  Connexion
                </Link>
                <Link to="/register"
                  style={{
                    padding: '8px 18px', fontSize: 13, fontWeight: 700,
                    color: '#fff', background: '#f97316', borderRadius: 10,
                    textDecoration: 'none', transition: 'all .15s',
                    boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden"
              style={{
                padding: '8px', borderRadius: 10, background: 'transparent',
                border: 'none', cursor: 'pointer', marginLeft: 4,
              }}
            >
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.div key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}>
                      <X size={21} color="#374151" />
                    </motion.div>
                  : <motion.div key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}>
                      <Menu size={21} color="#374151" />
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
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid #f3f4f6', background: '#fff' }}
          >
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '12px 16px 8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                style={{
                  flex: 1, padding: '10px 14px', fontSize: 13,
                  border: '1px solid #e5e7eb', borderRadius: 10,
                  outline: 'none', background: '#f9fafb',
                }}
              />
              <button type="submit" style={{
                padding: '10px 14px', background: '#f97316', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer',
              }}>
                <Search size={16} />
              </button>
            </form>

            {/* Profil mobile */}
            {isAuthenticated && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                margin: '0 16px 8px', padding: '10px 12px',
                background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8, overflow: 'hidden',
                  flexShrink: 0, outline: '2px solid #fed7aa',
                }}>
                  {user?.avatar
                    ? <img src={imgUrl(user.avatar)} alt=""
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg,#fb923c,#ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: '#fff', fontWeight: 900 }}>
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                  }
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{user?.username}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                    background: '#fef9c3', color: '#92400e',
                  }}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Catégories mobile */}
            {categories.length > 0 && (
              <div style={{ padding: '4px 16px 8px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af',
                             textTransform: 'uppercase', letterSpacing: '0.1em',
                             padding: '8px 4px 6px' }}>
                  Catégories
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {categories.map(cat => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', borderRadius: 10, textDecoration: 'none',
                        background: '#f9fafb', border: '1px solid #f3f4f6',
                      }}
                    >
                      <Package size={16} color="#d1d5db" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                        {cat.name.split(' ')[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Liens nav */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 8, marginTop: 4 }}>
                {[
                  { to: '/products', icon: ShoppingBag, label: 'Tout le catalogue' },
                  ...(isAuthenticated ? [
                    { to: '/orders',    icon: Package,         label: 'Mes commandes'  },
                    { to: '/messages',  icon: MessageCircle,   label: 'Messages'        },
                    { to: '/wishlist',  icon: Heart,           label: 'Mes favoris'     },
                    { to: '/profile',   icon: User,            label: 'Mon profil'      },
                    ...(dashboardPath
                      ? [{ to: dashboardPath, icon: LayoutDashboard, label: 'Tableau de bord' }]
                      : []),
                  ] : []),
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, fontSize: 13,
                      fontWeight: 600, color: '#374151', textDecoration: 'none',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={16} color="#9ca3af" /> {label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <button onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      color: '#ef4444', background: 'transparent', border: 'none',
                      cursor: 'pointer', marginTop: 4, borderTop: '1px solid #f3f4f6',
                      paddingTop: 12,
                    }}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8,
                                 paddingTop: 12, marginTop: 4, borderTop: '1px solid #f3f4f6' }}>
                    <Link to="/login"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        border: '2px solid #f97316', color: '#f97316', textDecoration: 'none',
                      }}>
                      Connexion
                    </Link>
                    <Link to="/register"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: '#f97316', color: '#fff', textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                      }}>
                      S'inscrire gratuitement
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
