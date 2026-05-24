from django.core.management.base import BaseCommand
from apps.orders.models import PromoCode


PROMOS = [
    {
        'code':             'SAHEL1',
        'discount_type':    'free_delivery',
        'discount_value':   0,
        'min_order_amount': 0,
        'description':      'Livraison gratuite pour les nouveaux clients',
        'max_uses':         500,
    },
    {
        'code':             'BIENVENUE',
        'discount_type':    'percent',
        'discount_value':   10,
        'min_order_amount': 5000,
        'description':      '10% de remise dès 5 000 FCFA d\'achat',
        'max_uses':         200,
    },
    {
        'code':             'ARTISAN500',
        'discount_type':    'fixed',
        'discount_value':   500,
        'min_order_amount': 3000,
        'description':      '500 FCFA offerts sur votre commande',
        'max_uses':         None,
    },
]


class Command(BaseCommand):
    help = 'Crée les codes promo de démonstration'

    def handle(self, *args, **options):
        for data in PROMOS:
            obj, created = PromoCode.objects.get_or_create(
                code=data['code'],
                defaults={k: v for k, v in data.items() if k != 'code'},
            )
            status = 'créé' if created else 'déjà existant'
            self.stdout.write(f'  {obj.code} — {status}')
        self.stdout.write(self.style.SUCCESS('Codes promo chargés.'))
