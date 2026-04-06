from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemView, CheckoutView, OrderViewSet

router = DefaultRouter()
router.register('history', OrderViewSet, basename='order')

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart-items'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item-delete'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('', include(router.urls)),
]
