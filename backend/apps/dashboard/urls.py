from django.urls import path
from .views import GlobalDashboardView, ProducerDashboardView, ProducerExportView

urlpatterns = [
    path('global/', GlobalDashboardView.as_view(), name='global-dashboard'),
    path('producer/', ProducerDashboardView.as_view(), name='producer-dashboard'),
    path('producer/export/', ProducerExportView.as_view(), name='producer-export'),
]
