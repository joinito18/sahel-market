from django.contrib import admin
from .models import Category, Product, ProductImage, Rating, Like

class ProductImageInline(admin.TabularInline):
    model  = ProductImage
    extra  = 3
    fields = ['image', 'is_main']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'image']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['name', 'producer', 'category', 'price', 'stock', 'location', 'is_available']
    list_filter   = ['category', 'is_available']
    search_fields = ['name', 'description']
    list_editable = ['price', 'stock', 'is_available']
    inlines       = [ProductImageInline]
