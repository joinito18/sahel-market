from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings


try:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerUIView
    spectacular_urls = [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),
    ]
except ImportError:
    spectacular_urls = []

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',      include('apps.users.urls')),
    path('api/products/',  include('apps.products.urls')),
    path('api/orders/',    include('apps.orders.urls')),
    path('api/delivery/',  include('apps.delivery.urls')),
    path('api/agents/',    include('apps.agents.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/ai/',        include('apps.ai.urls')),
] + spectacular_urls + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)