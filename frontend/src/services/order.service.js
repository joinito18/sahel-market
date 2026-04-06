import api from './api.js'

export const orderService = {
  getCart:         ()          => api.get('/orders/cart/'),
  addToCart:       (data)      => api.post('/orders/cart/items/', data),
  removeFromCart:  (itemId)    => api.delete(`/orders/cart/items/${itemId}/`),
  checkout:        (data)      => api.post('/orders/checkout/', data),
  getOrders:       ()          => api.get('/orders/history/'),
  getOrder:        (id)        => api.get(`/orders/history/${id}/`),
  confirmDelivery: (id)        => api.patch(`/orders/history/${id}/`, { is_delivery_confirmed: true }),
  getTracking:     (orderId)   => api.get(`/delivery/${orderId}/`),
}