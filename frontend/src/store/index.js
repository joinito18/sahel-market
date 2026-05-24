import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './authSlice.js'
import cartReducer     from './cartSlice.js'
import productReducer  from './productSlice.js'
import wishlistReducer from './wishlistSlice.js'

const loadState = (key) => {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : undefined
  } catch { return undefined }
}

const saveState = (key, state) => {
  try { localStorage.setItem(key, JSON.stringify(state)) } catch {}
}

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    product:  productReducer,
    wishlist: wishlistReducer,
  },
  preloadedState: {
    auth:     loadState('sahel_auth'),
    cart:     (() => { const c = loadState('sahel_cart'); return c ? { ...c, isOpen: false } : undefined })(),
    wishlist: loadState('sahel_wishlist'),
  },
})

store.subscribe(() => {
  const s = store.getState()
  saveState('sahel_auth', s.auth)
  const { isOpen: _open, ...cartPersist } = s.cart
  saveState('sahel_cart', cartPersist)
  saveState('sahel_wishlist', s.wishlist)
})