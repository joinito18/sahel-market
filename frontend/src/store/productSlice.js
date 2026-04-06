import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'product',
  initialState: {
    filters: {
      search:   '',
      category: '',
      minPrice: '',
      maxPrice: '',
      ordering: '-created_at',
    },
    currentPage: 1,
  },
  reducers: {
    setFilters(state, action) {
      state.filters      = { ...state.filters, ...action.payload }
      state.currentPage  = 1
    },
    setPage(state, action) {
      state.currentPage = action.payload
    },
    resetFilters(state) {
      state.filters      = { search: '', category: '', minPrice: '', maxPrice: '', ordering: '-created_at' }
      state.currentPage  = 1
    },
  },
})

export const { setFilters, setPage, resetFilters } = productSlice.actions
export default productSlice.reducer