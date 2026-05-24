import api from './api.js'

export const productService = {
  getAll:        (params) => api.get('/products/', { params }),
  getOne:        (id)     => api.get(`/products/${id}/`),
  create:        (data)   => api.post('/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:        (id, data) => api.patch(`/products/${id}/`, data),
  delete:        (id)       => api.delete(`/products/${id}/`),
  like:          (id)       => api.post(`/products/${id}/like/`),
  getWishlist:   ()         => api.get('/products/wishlist/'),
  rate:          (id, data) => api.post(`/products/${id}/rate/`, data),
  getCategories: ()         => api.get('/products/categories/'),
  getStats:      ()         => api.get('/products/stats/'),
}