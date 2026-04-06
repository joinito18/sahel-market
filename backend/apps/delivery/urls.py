from django.urls import path
from .views import TrackingView

urlpatterns = [
    path('<int:order_id>/', TrackingView.as_view(), name='tracking'),
]
