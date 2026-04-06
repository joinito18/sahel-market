from django.urls import re_path
from .consumers import DeliveryConsumer

websocket_urlpatterns = [
    re_path(r'ws/delivery/(?P<order_id>\w+)/$', DeliveryConsumer.as_asgi()),
]
