from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

_old_stock = {}

@receiver(pre_save, sender='products.Product')
def _capture_old_stock(sender, instance, **kwargs):
    if instance.pk:
        try:
            _old_stock[instance.pk] = sender.objects.get(pk=instance.pk).stock
        except sender.DoesNotExist:
            pass

@receiver(post_save, sender='products.Product')
def _notify_stock_alerts(sender, instance, **kwargs):
    old = _old_stock.pop(instance.pk, None)
    if old is None or old > 0 or instance.stock == 0:
        return
    from .models import StockAlert
    from apps.orders.models import Notification
    alerts = StockAlert.objects.filter(product=instance, notified=False).select_related('user')
    to_update = []
    for alert in alerts:
        Notification.objects.create(
            user=alert.user,
            type='order_placed',
            title=f'"{instance.name[:40]}" est de nouveau disponible !',
            message=(
                f'Le produit "{instance.name}" que vous guettiez est de nouveau en stock. '
                f'Commandez vite avant rupture !'
            ),
        )
        alert.notified = True
        to_update.append(alert)
    StockAlert.objects.bulk_update(to_update, ['notified'])
