from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import requests
import uuid
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, CheckoutSerializer

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart, id=item_id).delete()
        return Response(CartSerializer(cart).data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(user=request.user)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=request.user,
            total_amount=cart.total + serializer.validated_data['delivery_fee'],
            delivery_address=serializer.validated_data['delivery_address'],
            delivery_fee=serializer.validated_data['delivery_fee'],
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.price,
            )

        transaction_id = str(uuid.uuid4()).replace('-', '')[:20].upper()

        cinetpay_data = {
            'apikey': settings.env('CINETPAY_API_KEY', default=''),
            'site_id': settings.env('CINETPAY_SITE_ID', default=''),
            'transaction_id': transaction_id,
            'amount': int(order.total_amount),
            'currency': 'XAF',
            'description': f'Commande #{order.id} - Sahel Market',
            'return_url': f'{settings.FRONTEND_URL}/orders/{order.id}',
            'notify_url': f'https://ton-domaine.com/api/orders/webhook/',
            'customer_name': request.user.username,
            'customer_email': request.user.email,
        }

        try:
            resp = requests.post('https://api-checkout.cinetpay.com/v2/payment', json=cinetpay_data, timeout=10)
            resp_data = resp.json()
            if resp_data.get('code') == '201':
                order.cinetpay_transaction_id = transaction_id
                order.save()
                cart.items.all().delete()
                return Response({
                    'order': OrderSerializer(order).data,
                    'payment_url': resp_data['data']['payment_url'],
                })
        except Exception:
            pass

        return Response({'order': OrderSerializer(order).data, 'payment_url': None})

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        if request.data.get('is_delivery_confirmed'):
            order.is_delivery_confirmed = True
            order.status = 'delivered'
            order.save()
        return Response(OrderSerializer(order).data)