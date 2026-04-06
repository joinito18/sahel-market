from django.db import models
from apps.orders.models import Order

class DeliveryTracking(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='tracking')
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Suivi commande #{self.order.id}"