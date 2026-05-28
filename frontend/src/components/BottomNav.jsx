import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Home, Grid3x3, ShoppingBag, Package, User, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleCart } from '../store/cartSlice.js'

export default function BottomNav() {
  const location  = useLocation()
  const dispatch  = useDispatch()
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const { itemCount } = useSelector(s => s.cart)

  const dashboardPath = {
    admin:    '/dashboard/admin',
    agent:    '/dashboard/agent',
    producer: '/dashboard/producer',
  }[user?.role]

  if (location.pathname.startsWith('/dashboard')) return null

  const tabs = isAuthenticated ? [
    { to: '/',         icon: Home,            label: 'Accueil'   },
    { to: '/products', icon: Grid3x3,         label: 'Catalogue' },
    { type: 'cart',    icon: ShoppingBag,     label: 'Panier'    },
    dashboardPath
      ? { to: dashboardPath, icon: LayoutDashboard, label: 'Dashboard' }
      : { to: '/orders',     icon: Package,        label: 'Commandes' },
    { to: '/profile',  icon: User,            label: 'Compte'    },
  ] : [
    { to: '/',         icon: Home,   label: 'Accueil'   },
    { to: '/products', icon: Grid3x3, label: 'Catalogue' },
    { type: 'cart',    icon: ShoppingBag, label: 'Panier' },
    { to: '/login',    icon: User,   label: 'Connexion'  },
  ]

  return (
    <nav
      className="bottom-nav-glass md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div style={{ display: 'flex', height: 56 }}>
        {tabs.map((tab) => {

          /* ── Panier ── */
          if (tab.type === 'cart') {
            return (
              <button
                key="cart"
                onClick={() => dispatch(toggleCart())}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3, border: 'none', background: 'none', cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <ShoppingBag size={22} color="#111111" strokeWidth={1.6} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                        style={{
                          position: 'absolute', top: -5, right: -6,
                          background: '#2D6A4F', color: '#fff',
                          fontSize: 9, fontWeight: 800,
                          minWidth: 16, height: 16, padding: '0 3px',
                          borderRadius: 8, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#6b6b6b', letterSpacing: '0.04em' }}>
                  PANIER
                </span>
              </button>
            )
          }

          /* ── Liens ── */
          const isActive = tab.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.to)
          const Icon = tab.icon

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
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  style={{
                    position: 'absolute', top: 0,
                    width: 20, height: 2, borderRadius: 2,
                    background: '#111111',
                  }}
                />
              )}
              <Icon
                size={22}
                color={isActive ? '#111111' : '#ADADAD'}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.04em',
                color: isActive ? '#111111' : '#ADADAD',
                textTransform: 'uppercase',
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
