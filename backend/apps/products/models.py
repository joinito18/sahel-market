from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    producer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=0)
    stock = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=200, blank=True)
    is_available = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    flash_price = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True)
    flash_end   = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_flash_active(self):
        from django.utils import timezone
        return bool(self.flash_price and self.flash_end and self.flash_end > timezone.now())

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if not ratings:
            return 0
        return round(sum(r.score for r in ratings) / len(ratings), 1)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)

class Rating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    photo   = models.ImageField(upload_to='rating_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']

class Like(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']

class StockAlert(models.Model):
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='alerts')
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_alerts')
    notified   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']

    def __str__(self):
        return f"{self.user.username} → {self.product.name}"