from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Notification
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
    subtotal    = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)
    product_id  = serializers.IntegerField(source='product.id', read_only=True, allow_null=True)
    main_image  = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'subtotal', 'main_image']

    def get_main_image(self, obj):
        if not obj.product:
            return None
        img = obj.product.images.filter(is_main=True).first() or obj.product.images.first()
        return img.image.url if img else None

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

class NotificationSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True, allow_null=True)

    class Meta:
        model  = Notification
        fields = ['id', 'type', 'title', 'message', 'order_id', 'is_read', 'created_at']
        read_only_fields = ['id', 'type', 'title', 'message', 'order_id', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    delivery_fee     = serializers.DecimalField(max_digits=8, decimal_places=0, default=0)
    payment_method   = serializers.ChoiceField(choices=['orange_money', 'mtn_momo', 'cash'])
    payment_phone    = serializers.CharField(max_length=20, required=False, allow_blank=True)
    apply_loyalty    = serializers.BooleanField(default=False, required=False)
    promo_code       = serializers.CharField(max_length=30, required=False, allow_blank=True)