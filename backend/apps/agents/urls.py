from django.urls import path
from .views import ProducerListView, StockUpdateView

urlpatterns = [
    path('producers/', ProducerListView.as_view(), name='producers'),
    path('stock/<int:product_id>/', StockUpdateView.as_view(), name='stock-update'),
]
