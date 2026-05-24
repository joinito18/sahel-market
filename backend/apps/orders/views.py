from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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

        payment_ref = 'CMD-' + str(uuid.uuid4()).replace('-', '')[:8].upper()
        order.payment_reference = payment_ref
        order.payment_method    = serializer.validated_data.get('payment_method', 'orange_money')
        order.payment_phone     = serializer.validated_data.get('payment_phone', '')
        order.save()

        cart.items.all().delete()

        return Response({
            'order':          OrderSerializer(order).data,
            'payment_ref':    payment_ref,
            'payment_method': order.payment_method,
            'instructions': {
                'orange_money': {
                    'numero': '+237 680 757 871',
                    'nom':    'Sahel Market',
                    'ref':    payment_ref,
                },
                'mtn_momo': {
                    'numero': '+237 680 757 871',
                    'nom':    'Sahel Market',
                    'ref':    payment_ref,
                },
                'cash': None,
            }.get(order.payment_method),
        })

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


class IsAgentOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['agent', 'admin']


STATUS_FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered']

class ManageOrdersView(APIView):
    permission_classes = [IsAgentOrAdmin]

    def get(self, request):
        qs = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(OrderSerializer(qs, many=True).data)

class ManageOrderDetailView(APIView):
    permission_classes = [IsAgentOrAdmin]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Commande introuvable.'}, status=404)

        new_status = request.data.get('status')
        if new_status and new_status in [s[0] for s in Order.STATUS_CHOICES]:
            order.status = new_status
            if new_status == 'delivered':
                order.is_delivery_confirmed = True
            order.save()
        return Response(OrderSerializer(order).data)