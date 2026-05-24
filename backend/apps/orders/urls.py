from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemView, CheckoutView, OrderViewSet, ManageOrdersView, ManageOrderDetailView

router = DefaultRouter()
router.register('history', OrderViewSet, basename='order')

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart-items'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item-delete'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('manage/', ManageOrdersView.as_view(), name='orders-manage'),
    path('manage/<int:pk>/', ManageOrderDetailView.as_view(), name='orders-manage-detail'),
    path('', include(router.urls)),
]
