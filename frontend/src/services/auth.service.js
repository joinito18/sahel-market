import api from './api.js'

export const authService = {
  register:           (data)   => api.post('/auth/register/', data),
  login:              (data)   => api.post('/auth/login/', data),
  logout:             (token)  => api.post('/auth/logout/', { refresh: token }),
  getMe:              ()       => api.get('/auth/me/'),
  updateMe:           (data)   => api.patch('/auth/me/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getReferral:        ()       => api.get('/auth/referral/'),
  validateReferral:   (code)   => api.get('/auth/referral/validate/', { params: { code } }),
}