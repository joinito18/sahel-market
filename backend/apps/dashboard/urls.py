from django.urls import path
from .views import GlobalDashboardView, ProducerDashboardView

urlpatterns = [
    path('global/', GlobalDashboardView.as_view(), name='global-dashboard'),
    path('producer/', ProducerDashboardView.as_view(), name='producer-dashboard'),
]
