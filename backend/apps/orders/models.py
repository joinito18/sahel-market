from django.db import models
from apps.users.models import User
from apps.products.models import Product

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def subtotal(self):
        return self.product.price * self.quantity

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('processing', 'En traitement'),
        ('shipped', 'Expédié'),
        ('delivered', 'Livré'),
        ('cancelled', 'Annulé'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=0)
    delivery_address = models.TextField()
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=0, default=0)
    PAYMENT_METHOD_CHOICES = [
        ('orange_money', 'Orange Money'),
        ('mtn_momo',     'MTN Mobile Money'),
        ('cash',         'Espèces à la livraison'),
    ]
    payment_reference  = models.CharField(max_length=100, blank=True)
    payment_method     = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='orange_money')
    payment_phone      = models.CharField(max_length=20, blank=True)
    is_delivery_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Commande #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=0)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity


class PromoCode(models.Model):
    DISCOUNT_TYPES = [
        ('fixed',         'Montant fixe (FCFA)'),
        ('percent',       'Pourcentage (%)'),
        ('free_delivery', 'Livraison gratuite'),
    ]
    code             = models.CharField(max_length=30, unique=True, db_index=True)
    discount_type    = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='fixed')
    discount_value   = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    description      = models.CharField(max_length=200, blank=True)
    is_active        = models.BooleanField(default=True)
    expiry_date      = models.DateField(null=True, blank=True)
    max_uses         = models.PositiveIntegerField(null=True, blank=True)
    used_count       = models.PositiveIntegerField(default=0)
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    def get_validity_error(self):
        from django.utils import timezone
        if not self.is_active:
            return 'Code promo inactif.'
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return 'Code promo expiré.'
        if self.max_uses and self.used_count >= self.max_uses:
            return 'Ce code promo a atteint son nombre maximum d\'utilisations.'
        return None


class DeliveryZone(models.Model):
    name      = models.CharField(max_length=200)
    cities    = models.TextField(help_text="Villes couvertes, séparées par des virgules")
    fee       = models.DecimalField(max_digits=8, decimal_places=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['fee']

    def __str__(self):
        return f"{self.name} — {int(self.fee)} FCFA"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('order_placed',    'Commande passée'),
        ('order_paid',      'Paiement confirmé'),
        ('order_processing','En préparation'),
        ('order_shipped',   'Expédié'),
        ('order_delivered', 'Livré'),
        ('order_cancelled', 'Annulé'),
        ('new_order',       'Nouvelle commande'),
    ]
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type      = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title     = models.CharField(max_length=200)
    message   = models.TextField()
    order     = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    is_read   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.user.username} — {self.title}"