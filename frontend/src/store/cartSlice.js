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
      const existing = state.items.find(i => i.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...product, quantity: 1 })
      }
      state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
      state.total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    },

    removeItem(state, action) {
      state.items     = state.items.filter(i => i.id !== action.payload)
      state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
      state.total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    },

    updateQuantity(state, action) {
      const { id, quantity } = action.payload
      const item = state.items.find(i => i.id === id)
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