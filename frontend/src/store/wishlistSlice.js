import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: [] },
  reducers: {
    setWishlist:  (state, action) => { state.ids = action.payload },
    toggleLike:   (state, action) => {
      const id  = action.payload
      const idx = state.ids.indexOf(id)
      if (idx === -1) state.ids.push(id)
      else            state.ids.splice(idx, 1)
    },
    clearWishlist: (state) => { state.ids = [] },
  },
})

export const { setWishlist, toggleLike, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
