import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:     [],
    isOpen:    false,
    itemCount: 0,
    total:     0,
  },
  reducers: {
    openCart(state)  { state.isOpen = true },
    closeCart(state) { state.isOpen = false },
    toggleCart(state) { state.isOpen = !state.isOpen },

    addItem(state, action) {
      const product = action.payload
      const qty = product.quantity ?? 1
      // key = id + variantId pour permettre le même produit en plusieurs variantes
      const key = `${product.id}_${product.variantId ?? ''}`
      const existing = state.items.find(i => i._key === key)
      if (existing) {
        existing.quantity += qty
      } else {
        state.items.push({ ...product, quantity: qty, _key: key })
      }
      state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
      state.total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    },

    removeItem(state, action) {
      state.items     = state.items.filter(i => i._key !== action.payload && i.id !== action.payload)
      state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
      state.total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    },

    updateQuantity(state, action) {
      const { id, quantity } = action.payload
      const item = state.items.find(i => i._key === id || i.id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
      state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
      state.total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    },

    clearCart(state) {
      state.items     = []
      state.itemCount = 0
      state.total     = 0
    },

    syncFromServer(state, action) {
      const { items, total } = action.payload
      state.items     = items
      state.total     = total
      state.itemCount = items.reduce((s, i) => s + i.quantity, 0)
    },
  },
})

export const { openCart, closeCart, toggleCart, addItem, removeItem,
               updateQuantity, clearCart, syncFromServer } = cartSlice.actions
export default cartSlice.reducer