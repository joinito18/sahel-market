import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Home, Grid3x3, ShoppingBag, Package, User, LayoutDashboard, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleCart } from '../store/cartSlice.js'

export default function BottomNav() {
  const location   = useLocation()
  const dispatch   = useDispatch()
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const { itemCount } = useSelector(s => s.cart)

  const dashboardPath = {
    admin:    '/dashboard/admin',
    agent:    '/dashboard/agent',
    producer: '/dashboard/producer',
  }[user?.role]

  // Masquer sur les dashboards (ils ont leur propre nav)
  if (location.pathname.startsWith('/dashboard')) return null

  const tabs = isAuthenticated ? [
    { to: '/',         icon: Home,            label: 'Accueil'   },
    { to: '/products', icon: Grid3x3,         label: 'Catalogue' },
    { type: 'cart',                           label: 'Panier'    },
    dashboardPath
      ? { to: dashboardPath, icon: LayoutDashboard, label: 'Dashboard'  }
      : { to: '/orders',     icon: Package,        label: 'Commandes'  },
    { to: '/profile',  icon: User,            label: 'Compte'    },
  ] : [
    { to: '/',         icon: Home,            label: 'Accueil'   },
    { to: '/products', icon: Grid3x3,         label: 'Catalogue' },
    { type: 'cart',                           label: 'Panier'    },
    { to: '/login',    icon: User,            label: 'Connexion' },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #f3f4f6',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', height: 60 }}>
        {tabs.map((tab) => {

          /* ── Bouton panier (centre, mis en valeur) ── */
          if (tab.type === 'cart') {
            return (
              <button
                key="cart"
                onClick={() => dispatch(toggleCart())}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-end',
                  paddingBottom: 8, border: 'none', background: 'none',
                  cursor: 'pointer', position: 'relative',
                }}
              >
                {/* Bouton flottant orange */}
                <div style={{
                  position: 'absolute', top: -18,
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#f97316,#ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(249,115,22,0.45)',
                  border: '3px solid #fff',
                }}>
                  <ShoppingBag size={22} color="#fff" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        style={{
                          position: 'absolute', top: -3, right: -3,
                          background: '#ef4444', color: '#fff',
                          fontSize: 9, fontWeight: 900,
                          minWidth: 17, height: 17, padding: '0 3px',
                          borderRadius: 9, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                          border: '1.5px solid #fff',
                        }}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', marginTop: 30 }}>
                  Panier
                </span>
              </button>
            )
          }

          /* ── Liens normaux ── */
          const isActive = tab.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.to)
          const color = isActive ? '#f97316' : '#9ca3af'

          return (
            <Link
              key={tab.to}
              to={tab.to}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, textDecoration: 'none', position: 'relative',
              }}
            >
              {/* Indicateur actif */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28, height: 3, borderRadius: 2,
                    background: '#f97316',
                  }}
                />
              )}
              <tab.icon size={21} color={color} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color,
                letterSpacing: isActive ? 0 : '0.01em',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
