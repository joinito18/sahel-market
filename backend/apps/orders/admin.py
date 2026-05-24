from django.contrib import admin
from .models import Order, OrderItem, PromoCode


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'quantity', 'unit_price', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'payment_method', 'created_at']
    list_filter  = ['status', 'payment_method']
    search_fields = ['user__username', 'payment_reference']
    inlines = [OrderItemInline]


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'used_count', 'max_uses', 'expiry_date']
    list_filter  = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
