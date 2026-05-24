from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'updated_at']

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='user.username', read_only=True)
    client_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'delivery_address', 'delivery_fee',
                  'payment_method', 'payment_phone', 'payment_reference',
                  'items', 'is_delivery_confirmed', 'created_at', 'updated_at',
                  'client_name', 'client_phone']
        read_only_fields = ['id', 'total_amount', 'payment_reference', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    delivery_fee     = serializers.DecimalField(max_digits=8, decimal_places=0, default=0)
    payment_method   = serializers.ChoiceField(choices=['orange_money', 'mtn_momo', 'cash'])
    payment_phone    = serializers.CharField(max_length=20, required=False, allow_blank=True)