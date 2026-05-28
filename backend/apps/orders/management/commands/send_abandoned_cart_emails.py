from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from apps.orders.models import Cart


class Command(BaseCommand):
    help = 'Envoie des emails de relance pour les paniers abandonnés (>24h sans commande)'

    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(hours=24)
        no_repeat = timezone.now() - timedelta(hours=48)

        carts = (Cart.objects
                 .filter(updated_at__lt=threshold)
                 .filter(items__isnull=False)
                 .filter(
                     last_abandoned_email__isnull=True
                 ) | Cart.objects
                 .filter(updated_at__lt=threshold)
                 .filter(items__isnull=False)
                 .filter(last_abandoned_email__lt=no_repeat)
                 ).select_related('user').prefetch_related('items__product').distinct()

        sent = 0
        for cart in carts:
            if not cart.user.email or not cart.items.exists():
                continue
            try:
                self._send(cart)
                sent += 1
            except Exception as e:
                self.stderr.write(f'Erreur cart {cart.id}: {e}')

        self.stdout.write(self.style.SUCCESS(f'{sent} email(s) envoyé(s)'))

    def _send(self, cart):
        items = list(cart.items.select_related('product').all())
        lines = '\n'.join(
            f"  • {i.product.name} × {i.quantity}  —  {int(i.product.price * i.quantity):,} FCFA".replace(',', ' ')
            for i in items
        )
        total = sum(i.product.price * i.quantity for i in items)
        name  = cart.user.first_name or cart.user.username

        body = f"""Bonjour {name},

Vous avez laissé des articles dans votre panier Sahel Market ! 🛒

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 VOTRE PANIER
{lines}

   Total estimé : {int(total):,} FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ces produits artisanaux vous attendent.
Ne laissez pas passer l'occasion !

👉 Finaliser ma commande :
https://sahel-market-gamma.vercel.app/cart

Pour toute question : sahelmarket@gmail.com · +237 680 757 871

L'équipe Sahel Market 🇨🇲
""".replace(',', ' ')

        send_mail(
            subject='Vous avez oublié quelque chose 🛒 — Sahel Market',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cart.user.email],
            fail_silently=False,
        )
        cart.last_abandoned_email = timezone.now()
        cart.save(update_fields=['last_abandoned_email'])
