import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Search, ChevronDown, Package, Grid3x3, Heart,
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
  admin:    'Administrateur',
  agent:    'Agent',
  producer: 'Artisan',
  client:   'Client',
}

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const { itemCount, total }      = useSelector(s => s.cart)

  const [userDropdown,  setUserDropdown]  = useState(false)
  const [catOpen,       setCatOpen]       = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef      = useRef(null)
  const catRef           = useRef(null)
  const notifRef         = useRef(null)
  const mobileNotifRef   = useRef(null)
  const qc               = useQueryClient()

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false)
      if (catRef.current      && !catRef.current.contains(e.target))      setCatOpen(false)
      const inDesktopNotif = notifRef.current?.contains(e.target)
      const inMobileNotif  = mobileNotifRef.current?.contains(e.target)
      if (!inDesktopNotif && !inMobileNotif) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setUserDropdown(false); setCatOpen(false); setNotifOpen(false)
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

  /* ── Panneau notifications partagé mobile + desktop ── */
  const NotifPanel = (
    <AnimatePresence>
      {notifOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="notif-dropdown"
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 340, background: '#fff', borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #E8E7E2', overflow: 'hidden', zIndex: 60,
          }}
        >
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #E8E7E2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#111111' }}>Notifications</p>
            {unread === 0 && (
              <span style={{ fontSize: 11, color: '#ADADAD', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={13} /> Tout lu
              </span>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Bell size={28} color="#E8E7E2" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#ADADAD', fontSize: 13 }}>Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => (
                <Link key={n.id} to={n.order_id ? '/orders' : '#'}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    textDecoration: 'none', borderBottom: '1px solid #F5F4EF',
                    background: n.is_read ? '#fff' : '#FFF9F5',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: n.is_read ? '#F5F4EF' : '#FFF3E8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShoppingCart size={14} color={n.is_read ? '#ADADAD' : '#f97316'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: n.is_read ? 500 : 700, color: '#111111', marginBottom: 2 }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#6B6B6B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 10, color: '#ADADAD', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', flexShrink: 0, marginTop: 5 }} />
                  )}
                </Link>
              ))
            )}
          </div>

          <Link to="/orders" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px', fontSize: 11, fontWeight: 700, color: '#111111',
            textDecoration: 'none', borderTop: '1px solid #E8E7E2',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Mes commandes →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #E8E7E2',
    }}>

      {/* ════════════════════════ MOBILE HEADER ════════════════════════ */}
      <div className="md:hidden" style={{
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 16px', justifyContent: 'space-between',
      }}>
        {/* Wordmark */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '-0.01em',
          }}>
            Sahel<em>Market</em>
          </span>
        </Link>

        {/* Actions mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Recherche */}
          <button
            onClick={() => navigate('/products')}
            style={{ padding: 9, borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Rechercher"
          >
            <Search size={20} color="#111111" />
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }} ref={mobileNotifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); if (!notifOpen && unread > 0) markAllRead.mutate() }}
                style={{ position: 'relative', padding: 9, borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Notifications"
              >
                <Bell size={20} color="#111111" />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#f97316', border: '1.5px solid #fff',
                  }} />
                )}
              </button>
              {NotifPanel}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════ DESKTOP NAV ══════════════════════════ */}
      <div className="hidden md:flex" style={{
        alignItems: 'center', gap: 8, height: 64,
        padding: '0 24px', maxWidth: 1440, margin: '0 auto',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 4, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, background: '#111111', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700 }}>S</span>
          </div>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-0.01em',
          }}>
            Sahel<em>Market</em>
          </span>
        </Link>

        {/* Catégories */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={catRef}>
          <button
            onClick={() => setCatOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: '#111111', background: catOpen ? '#F5F4EF' : 'transparent',
              border: '1px solid transparent', cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
            onMouseLeave={e => e.currentTarget.style.background = catOpen ? '#F5F4EF' : 'transparent'}
          >
            <Grid3x3 size={14} />
            Catégories
            <ChevronDown size={12} style={{ transition: 'transform .2s', transform: catOpen ? 'rotate(180deg)' : 'none' }} />
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
                  width: 440, background: '#fff', borderRadius: 16,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.1)', border: '1px solid #E8E7E2',
                  zIndex: 60, overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid #F5F4EF' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#ADADAD', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Nos collections
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#F5F4EF', padding: 1 }}>
                  {categories.map(cat => {
                    const src = imgUrl(cat.image)
                    return (
                      <Link key={cat.id} to={`/products?category=${cat.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', background: '#fff', textDecoration: 'none', transition: 'background .12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, overflow: 'hidden',
                          flexShrink: 0, background: '#F0EFE9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {src
                            ? <img src={src} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={16} color="#D4D3CE" />}
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{cat.name}</p>
                      </Link>
                    )
                  })}
                </div>
                <Link to="/products" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '11px', fontSize: 11, fontWeight: 700, color: '#111111',
                  textDecoration: 'none', borderTop: '1px solid #E8E7E2',
                  letterSpacing: '0.06em', textTransform: 'uppercase', background: '#fff',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Voir tout le catalogue →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520 }}>
          <div style={{
            display: 'flex', borderRadius: 12, overflow: 'hidden',
            border: `1.5px solid ${searchFocused ? '#111111' : '#E8E7E2'}`,
            transition: 'border-color .2s',
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Rechercher un produit artisanal…"
              style={{
                flex: 1, padding: '9px 16px', fontSize: 13, outline: 'none',
                background: '#F5F4EF', color: '#111111', border: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '0 16px', background: '#111111', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <Search size={15} color="#fff" />
            </button>
          </div>
        </form>

        {/* Actions droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>

          {/* Favoris */}
          {isAuthenticated && (
            <Link to="/wishlist" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 10, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Heart size={20} color="#111111" />
            </Link>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); if (!notifOpen && unread > 0) markAllRead.mutate() }}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center',
                  padding: '7px 10px', borderRadius: 10, background: 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Bell size={20} color="#111111" />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#f97316', border: '1.5px solid #fff',
                  }} />
                )}
              </button>
              {NotifPanel}
            </div>
          )}

          {/* Messages */}
          {isAuthenticated && (
            <Link to="/messages" style={{
              display: 'flex', alignItems: 'center', padding: '7px 10px',
              borderRadius: 10, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MessageCircle size={20} color="#111111" />
            </Link>
          )}

          {/* Panier */}
          <button
            onClick={() => dispatch(toggleCart())}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
              background: 'transparent', border: 'none', position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={20} color="#111111" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      position: 'absolute', top: -7, right: -7,
                      background: '#f97316', color: '#fff',
                      fontSize: 9, fontWeight: 800,
                      minWidth: 16, height: 16, padding: '0 3px',
                      borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 9, color: '#ADADAD', lineHeight: 1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Panier</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#111111', lineHeight: 1, marginTop: 2 }}>
                {itemCount > 0 ? `${Number(total).toLocaleString('fr-FR')} FCFA` : 'Vide'}
              </p>
            </div>
          </button>

          {/* Utilisateur connecté */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setUserDropdown(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px 5px 5px', borderRadius: 10, cursor: 'pointer',
                  background: userDropdown ? '#F5F4EF' : 'transparent',
                  border: '1px solid transparent', transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                onMouseLeave={e => e.currentTarget.style.background = userDropdown ? '#F5F4EF' : 'transparent'}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1.5px solid #E8E7E2' }}>
                  {user?.avatar
                    ? <img src={imgUrl(user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{
                        width: '100%', height: '100%', background: '#111111',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                  }
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>
                  {user?.first_name || user?.username}
                </span>
                <ChevronDown size={12} color="#ADADAD" style={{ transition: 'transform .2s', transform: userDropdown ? 'rotate(180deg)' : 'none' }} />
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
                      width: 220, background: '#fff', borderRadius: 16,
                      boxShadow: '0 24px 60px rgba(0,0,0,0.1)', border: '1px solid #E8E7E2',
                      overflow: 'hidden', zIndex: 60,
                    }}
                  >
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8E7E2' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 2 }}>
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                      </p>
                      <p style={{ fontSize: 11, color: '#ADADAD' }}>{ROLE_LABELS[user?.role] || 'Client'}</p>
                    </div>

                    <div style={{ padding: '6px 0' }}>
                      {[
                        { to: '/profile', icon: User,            label: 'Mon profil' },
                        { to: '/orders',  icon: Package,         label: 'Mes commandes' },
                        ...(dashboardPath ? [{ to: dashboardPath, icon: LayoutDashboard, label: 'Tableau de bord' }] : []),
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 16px', fontSize: 13, color: '#111111', textDecoration: 'none',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Icon size={14} color="#ADADAD" /> {label}
                        </Link>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #E8E7E2', padding: '6px 0' }}>
                      <button onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 16px', fontSize: 13, color: '#6B6B6B',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F4EF'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} color="#ADADAD" /> Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <Link to="/login" style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#111111',
                textDecoration: 'none', borderRadius: 100, border: '1.5px solid #E8E7E2',
                letterSpacing: '0.04em',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#111111'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E7E2'}
              >
                Connexion
              </Link>
              <Link to="/register" className="btn-accent" style={{ padding: '8px 18px', fontSize: 12 }}>
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
