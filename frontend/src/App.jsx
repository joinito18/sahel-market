import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { setWishlist, clearWishlist } from './store/wishlistSlice.js'
import { productService } from './services/product.service.js'

import Navbar            from './components/Navbar.jsx'
import BottomNav         from './components/BottomNav.jsx'
import CartDrawer        from './components/CartDrawer.jsx'
import ChatWidget        from './components/ChatWidget.jsx'
import Footer            from './components/Footer.jsx'
import SuggestionWidget  from './components/SuggestionWidget.jsx'
import PwaInstallBanner  from './components/PwaInstallBanner.jsx'

// Lazy-loaded pages — code splitting automatique par route
const Home              = lazy(() => import('./pages/Home.jsx'))
const Products          = lazy(() => import('./pages/Products.jsx'))
const ProductDetail     = lazy(() => import('./pages/ProductDetail.jsx'))
const Login             = lazy(() => import('./pages/Login.jsx'))
const Register          = lazy(() => import('./pages/Register.jsx'))
const Cart              = lazy(() => import('./pages/Cart.jsx'))
const Checkout          = lazy(() => import('./pages/Checkout.jsx'))
const OrderHistory      = lazy(() => import('./pages/OrderHistory.jsx'))
const TrackOrder        = lazy(() => import('./pages/TrackOrder.jsx'))
const Profile           = lazy(() => import('./pages/Profile.jsx'))
const HowItWorks        = lazy(() => import('./pages/HowItWorks.jsx'))
const ProducerDashboard = lazy(() => import('./pages/dashboard/ProducerDashboard.jsx'))
const AdminDashboard    = lazy(() => import('./pages/dashboard/AdminDashboard.jsx'))
const AgentDashboard    = lazy(() => import('./pages/dashboard/AgentDashboard.jsx'))
const ProducerPublicProfile = lazy(() => import('./pages/ProducerPublicProfile.jsx'))
const Terms             = lazy(() => import('./pages/legal/Terms.jsx'))
const Privacy           = lazy(() => import('./pages/legal/Privacy.jsx'))
const Returns           = lazy(() => import('./pages/legal/Returns.jsx'))
const Delivery          = lazy(() => import('./pages/legal/Delivery.jsx'))
const Faq               = lazy(() => import('./pages/legal/Faq.jsx'))
const Wishlist          = lazy(() => import('./pages/Wishlist.jsx'))
const Messages          = lazy(() => import('./pages/Messages.jsx'))
const Roadmap           = lazy(() => import('./pages/Roadmap.jsx'))
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword     = lazy(() => import('./pages/ResetPassword.jsx'))
const ArtisansMap       = lazy(() => import('./pages/ArtisansMap.jsx'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles }) {
  const { isAuthenticated, user } = useSelector(s => s.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl">404</p>
      <h1 className="text-2xl font-bold text-gray-800">Page introuvable</h1>
      <p className="text-gray-500 text-sm max-w-sm">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <a href="/"
        className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-orange-500
                   text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm">
        Retour à l'accueil
      </a>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function WishlistSync() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    if (!isAuthenticated) { dispatch(clearWishlist()); return }
    productService.getWishlist()
      .then(res => {
        const products = Array.isArray(res.data) ? res.data
          : Array.isArray(res.data?.results) ? res.data.results : []
        dispatch(setWishlist(products.map(p => p.id)))
      })
      .catch(() => {})
  }, [isAuthenticated, dispatch])

  return null
}

function urlB64ToUint8Array(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function PushSetup() {
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    if (!isAuthenticated) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    // Délai pour ne pas interrompre le chargement initial
    const timer = setTimeout(async () => {
      try {
        const reg = await navigator.serviceWorker.ready

        // Récupérer la clé publique VAPID depuis le backend
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        const keyRes = await fetch(`${apiBase}/auth/push-vapid-key/`)
        const { public_key: vapidKey } = await keyRes.json()
        if (!vapidKey) return

        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          // Synchroniser l'abonnement existant avec le backend
          await fetch(`${apiBase}/auth/push-subscribe/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(existing.toJSON()),
          })
          return
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidKey),
        })
        await fetch(`${apiBase}/auth/push-subscribe/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(sub.toJSON()),
        })
      } catch {}
    }, 3000)

    return () => clearTimeout(timer)
  }, [isAuthenticated])

  return null
}

export default function App() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <WishlistSync />
      <PushSetup />
      <Navbar />
      <CartDrawer />
      <ChatWidget />
      <SuggestionWidget />

      <PwaInstallBanner />
      {/* Padding bottom safe-area aware pour la BottomNav fixe */}
      <div className="flex-1 safe-bottom">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
          <Routes location={location}>

            {/* ── Pages publiques ─────────────────────────────── */}
            <Route path="/"              element={<Home />} />
            <Route path="/products"      element={<Products />} />
            <Route path="/products/:id"  element={<ProductDetail />} />
            <Route path="/login"                           element={<Login />} />
            <Route path="/register"                       element={<Register />} />
            <Route path="/forgot-password"               element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token"    element={<ResetPassword />} />
            <Route path="/how-it-works"      element={<HowItWorks />} />
            <Route path="/roadmap"           element={<Roadmap />} />
            <Route path="/artisans"          element={<ArtisansMap />} />
            <Route path="/artisans/:username" element={<ProducerPublicProfile />} />

            {/* ── Pages légales ───────────────────────────────── */}
            <Route path="/legal/terms"    element={<Terms />}    />
            <Route path="/legal/privacy"  element={<Privacy />}  />
            <Route path="/legal/returns"  element={<Returns />}  />
            <Route path="/legal/delivery" element={<Delivery />} />
            <Route path="/legal/faq"      element={<Faq />}      />

            {/* ── Pages privées (client) ───────────────────────── */}
            <Route path="/wishlist" element={
              <PrivateRoute><Wishlist /></PrivateRoute>
            } />
            <Route path="/messages" element={
              <PrivateRoute><Messages /></PrivateRoute>
            } />
            <Route path="/messages/:userId" element={
              <PrivateRoute><Messages /></PrivateRoute>
            } />
            <Route path="/cart" element={
              <PrivateRoute><Cart /></PrivateRoute>
            } />
            <Route path="/checkout" element={
              <PrivateRoute><Checkout /></PrivateRoute>
            } />
            <Route path="/orders" element={
              <PrivateRoute><OrderHistory /></PrivateRoute>
            } />
            <Route path="/orders/:id/track" element={
              <PrivateRoute><TrackOrder /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />

            {/* ── Dashboards (rôles) ──────────────────────────── */}
            <Route path="/dashboard/producer" element={
              <RoleRoute roles={['producer']}>
                <ProducerDashboard />
              </RoleRoute>
            } />
            <Route path="/dashboard/admin" element={
              <RoleRoute roles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            } />
            <Route path="/dashboard/agent" element={
              <RoleRoute roles={['agent', 'admin']}>
                <AgentDashboard />
              </RoleRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      <Footer />
      <BottomNav />
    </div>
  )
}
