import axios from 'axios'
import { store } from '../store/index.js'
import { setCredentials, logout } from '../store/authSlice.js'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = store.getState().auth.refreshToken
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken })
          store.dispatch(setCredentials({
            user:   store.getState().auth.user,
            tokens: { access: data.access, refresh: refreshToken },
          }))
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          store.dispatch(logout())
        }
      } else {
        store.dispatch(logout())
      }
    }
    return Promise.reject(error)
  }
)

export default api