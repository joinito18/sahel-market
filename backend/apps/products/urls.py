from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, platform_stats

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('stats/', platform_stats),
    path('', include(router.urls)),
]
