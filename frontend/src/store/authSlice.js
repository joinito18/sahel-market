import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    accessToken:     null,
    refreshToken:    null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials(state, action) {
      const { user, tokens } = action.payload
      state.user            = user
      state.accessToken     = tokens.access
      state.refreshToken    = tokens.refresh
      state.isAuthenticated = true
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
    logout(state) {
      state.user            = null
      state.accessToken     = null
      state.refreshToken    = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer