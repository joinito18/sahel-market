import api from './api.js'

export const authService = {
  register: (data)         => api.post('/auth/register/', data),
  login:    (data)         => api.post('/auth/login/', data),
  logout:   (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getMe:    ()             => api.get('/auth/me/'),
  updateMe: (data)         => api.patch('/auth/me/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}