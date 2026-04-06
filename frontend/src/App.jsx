import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Navbar         from './components/Navbar.jsx'
import CartDrawer     from './components/CartDrawer.jsx'
import ChatWidget     from './components/ChatWidget.jsx'

import Home           from './pages/Home.jsx'
import Products       from './pages/Products.jsx'
import ProductDetail  from './pages/ProductDetail.jsx'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import Cart           from './pages/Cart.jsx'
import Checkout       from './pages/Checkout.jsx'
import OrderHistory   from './pages/OrderHistory.jsx'
import TrackOrder     from './pages/TrackOrder.jsx'
import Profile        from './pages/Profile.jsx'
import ProducerDashboard from './pages/dashboard/ProducerDashboard.jsx'
import AdminDashboard    from './pages/dashboard/AdminDashboard.jsx'
import AgentDashboard    from './pages/dashboard/AgentDashboard.jsx'

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

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <ChatWidget />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/products"    element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />

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
        <Route path="/dashboard/producer" element={
          <RoleRoute roles={['producer']}><ProducerDashboard /></RoleRoute>
        } />
        <Route path="/dashboard/admin" element={
          <RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>
        } />
        <Route path="/dashboard/agent" element={
          <RoleRoute roles={['agent']}><AgentDashboard /></RoleRoute>
        } />
      </Routes>
    </>
  )
}