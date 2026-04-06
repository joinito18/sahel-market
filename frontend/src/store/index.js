import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './authSlice.js'
import cartReducer    from './cartSlice.js'
import productReducer from './productSlice.js'

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
    auth:    authReducer,
    cart:    cartReducer,
    product: productReducer,
  },
  preloadedState: {
    auth: loadState('sahel_auth'),
    cart: loadState('sahel_cart'),
  },
})

store.subscribe(() => {
  const s = store.getState()
  saveState('sahel_auth', s.auth)
  saveState('sahel_cart', s.cart)
})