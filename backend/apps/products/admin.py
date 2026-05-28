from django.contrib import admin
from .models import Category, Product, ProductImage, Rating, Like, StockAlert, ProductVariant


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'score', 'created_at']
    list_filter   = ['score']
    search_fields = ['user__username', 'product__name']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'created_at']
    search_fields = ['user__username', 'product__name']

class ProductImageInline(admin.TabularInline):
    model  = ProductImage
    extra  = 3
    fields = ['image', 'is_main']

class ProductVariantInline(admin.TabularInline):
    model  = ProductVariant
    extra  = 2
    fields = ['type', 'label', 'extra_price', 'stock']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'image']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['name', 'producer', 'category', 'price', 'stock', 'flash_price', 'flash_end', 'location', 'is_available']
    list_filter   = ['category', 'is_available']
    search_fields = ['name', 'description']
    list_editable = ['price', 'stock', 'flash_price', 'flash_end', 'is_available']
    inlines       = [ProductImageInline, ProductVariantInline]
    fieldsets     = [
        (None,           {'fields': ['producer', 'category', 'name', 'description', 'price', 'stock', 'location', 'is_available']}),
        ('Vente Flash',  {'fields': ['flash_price', 'flash_end'], 'classes': ['collapse']}),
    ]


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'notified', 'created_at']
    list_filter   = ['notified']
    search_fields = ['user__username', 'product__name']
