from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid, json
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cart, CartItem, Order, OrderItem, Notification, PromoCode, DeliveryZone
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, CheckoutSerializer, NotificationSerializer, DeliveryZoneSerializer
from .campay_service import CampayService, CampayError
from apps.users.push_utils import send_push


def send_order_confirmation(order, payment_ref, instructions):
    """Envoie un email de confirmation à l'acheteur après la commande."""
    if not order.user.email:
        return
    pm_labels = {'orange_money': 'Orange Money', 'mtn_momo': 'MTN Mobile Money', 'cash': 'Espèces à la livraison'}
    pm_label = pm_labels.get(order.payment_method, order.payment_method)

    if instructions:
        payment_block = (
            f"\n📲 INSTRUCTIONS DE PAIEMENT\n"
            f"   Moyen       : {pm_label}\n"
            f"   Numéro      : {instructions['numero']}\n"
            f"   Nom         : {instructions['nom']}\n"
            f"   Référence   : {payment_ref}\n"
            f"\n   → Envoyez le montant exact, puis mentionnez la référence comme motif."
        )
    else:
        payment_block = f"\n💵 Paiement : {pm_label} (à la livraison)"

    items_lines = '\n'.join(
        f"   • {i.product.name} × {i.quantity}  —  {i.price * i.quantity:,.0f} FCFA"
        for i in order.items.select_related('product').all()
    )

    body = f"""Bonjour {order.user.first_name or order.user.username},

Votre commande #{order.id} a bien été enregistrée sur Sahel Market. 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 VOTRE COMMANDE
{items_lines}

   Livraison   : {order.delivery_address}
   Total       : {order.total_amount:,.0f} FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{payment_block}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Suivez votre commande sur :
https://sahel-market-gamma.vercel.app/orders/{order.id}/track

Pour toute question : sahelmarket@gmail.com · +237 680 757 871

Merci de soutenir l'artisanat camerounais ! 🇨🇲
L'équipe Sahel Market
"""
    try:
        send_mail(
            subject=f'Sahel Market — Confirmation commande #{order.id}',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            fail_silently=True,
        )
    except Exception:
        pass

STATUS_MESSAGES = {
    'paid':       ('Paiement confirmé',    'Votre paiement pour la commande #{id} a été confirmé. Merci !'),
    'processing': ('En préparation',       'Votre commande #{id} est en cours de préparation par l\'artisan.'),
    'shipped':    ('Commande expédiée 🚚', 'Votre commande #{id} est en route ! Suivez sa livraison.'),
    'delivered':  ('Commande livrée ✅',   'Votre commande #{id} a été livrée. Bonne réception !'),
    'cancelled':  ('Commande annulée',     'Votre commande #{id} a été annulée. Contactez-nous si besoin.'),
}

def create_order_notification(order, new_status):
    info = STATUS_MESSAGES.get(new_status)
    if not info:
        return
    title, msg_tpl = info
    body = msg_tpl.replace('{id}', str(order.id))
    Notification.objects.create(
        user=order.user,
        type=f'order_{new_status}',
        title=title,
        message=body,
        order=order,
    )
    send_push(order.user, title, body, url=f'/orders/{order.id}/track')

class DeliveryZonesView(APIView):
    """Zones de livraison avec tarifs — endpoint public."""
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        zones = DeliveryZone.objects.filter(is_active=True)
        return Response(DeliveryZoneSerializer(zones, many=True).data)


class PromoValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        cart_total = int(request.data.get('cart_total', 0))

        try:
            promo = PromoCode.objects.get(code=code)
        except PromoCode.DoesNotExist:
            return Response({'error': 'Code promo invalide.'}, status=400)

        error = promo.get_validity_error()
        if error:
            return Response({'error': error}, status=400)

        if cart_total < int(promo.min_order_amount):
            return Response({
                'error': f'Montant minimum requis : {int(promo.min_order_amount):,} FCFA.'.replace(',', ' ')
            }, status=400)

        if promo.discount_type == 'fixed':
            discount = min(int(promo.discount_value), cart_total)
        elif promo.discount_type == 'percent':
            discount = int(cart_total * int(promo.discount_value) / 100)
        else:  # free_delivery
            discount = 0

        return Response({
            'valid': True,
            'code': promo.code,
            'discount_type': promo.discount_type,
            'discount_value': int(promo.discount_value),
            'discount_amount': discount,
            'description': promo.description or (
                f'{int(promo.discount_value):,} FCFA de remise'.replace(',', ' ')
                if promo.discount_type == 'fixed' else
                f'{int(promo.discount_value)}% de remise'
                if promo.discount_type == 'percent' else
                'Livraison gratuite'
            ),
        })


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

        user = request.user
        loyalty_discount = 0
        if serializer.validated_data.get('apply_loyalty') and user.loyalty_points >= 100:
            full_rewards = user.loyalty_points // 100
            loyalty_discount = full_rewards * 500
            loyalty_discount = min(loyalty_discount, int(cart.total))
            points_used = (loyalty_discount // 500) * 100
            user.loyalty_points -= points_used
            user.save(update_fields=['loyalty_points'])

        # Code promo
        promo_discount = 0
        promo_free_delivery = False
        promo_obj = None
        raw_code = serializer.validated_data.get('promo_code', '').strip().upper()
        if raw_code:
            try:
                promo_obj = PromoCode.objects.get(code=raw_code)
                if not promo_obj.get_validity_error():
                    if promo_obj.discount_type == 'fixed':
                        promo_discount = min(int(promo_obj.discount_value), int(cart.total))
                    elif promo_obj.discount_type == 'percent':
                        promo_discount = int(int(cart.total) * int(promo_obj.discount_value) / 100)
                    elif promo_obj.discount_type == 'free_delivery':
                        promo_free_delivery = True
            except PromoCode.DoesNotExist:
                pass

        delivery_fee = int(serializer.validated_data['delivery_fee'])
        if promo_free_delivery:
            delivery_fee = 0

        total_amount = max(0, int(cart.total) + delivery_fee - loyalty_discount - promo_discount)

        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            delivery_address=serializer.validated_data['delivery_address'],
            delivery_fee=delivery_fee,
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.price,
            )
            # Déduire le stock
            product = item.product
            product.stock = max(0, product.stock - item.quantity)
            product.save(update_fields=['stock'])
            # Notifier l'artisan si stock bas (≤ 3)
            if product.stock <= 3 and product.producer:
                Notification.objects.get_or_create(
                    user=product.producer,
                    type='order_placed',
                    title=f'Stock faible — {product.name[:40]}',
                    defaults={
                        'message': (
                            f'Il ne reste que {product.stock} exemplaire(s) de "{product.name}". '
                            f'Pensez à réapprovisionner.'
                        ),
                    },
                )
            # Notifier l'artisan d'une nouvelle commande
            Notification.objects.create(
                user=product.producer,
                type='new_order',
                title='Nouvelle commande reçue 🛍️',
                message=f'Vous avez reçu une commande pour "{product.name}" (×{item.quantity}).',
                order=order,
            )

        payment_ref = 'CMD-' + str(uuid.uuid4()).replace('-', '')[:8].upper()
        order.payment_reference = payment_ref
        order.payment_method    = serializer.validated_data.get('payment_method', 'orange_money')
        order.payment_phone     = serializer.validated_data.get('payment_phone', '')
        order.save()

        if promo_obj:
            promo_obj.used_count += 1
            promo_obj.save(update_fields=['used_count'])

        cart.items.all().delete()

        Notification.objects.create(
            user=request.user,
            type='order_placed',
            title='Commande passée ✓',
            message=f'Votre commande #{order.id} a bien été enregistrée. Procédez au paiement pour la confirmer.',
            order=order,
        )

        instructions = {
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
        }.get(order.payment_method)

        # ── Tentative Campay (USSD push automatique) ──────────────────
        campay_initiated = False
        if order.payment_method in ('orange_money', 'mtn_momo') and CampayService.is_configured():
            phone = order.payment_phone or (
                request.user.phone if hasattr(request.user, 'phone') else ''
            )
            if phone:
                try:
                    CampayService.collect(
                        amount_xaf=order.total_amount,
                        phone=phone,
                        description=f'Commande Sahel Market #{order.id}',
                        external_ref=payment_ref,
                    )
                    campay_initiated = True
                except CampayError:
                    pass  # Fallback vers les instructions manuelles

        send_order_confirmation(order, payment_ref, instructions)

        return Response({
            'order':             OrderSerializer(order).data,
            'payment_ref':       payment_ref,
            'payment_method':    order.payment_method,
            'loyalty_discount':  loyalty_discount,
            'promo_discount':    promo_discount,
            'instructions':      instructions,
            'campay_initiated':  campay_initiated,
        })

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        if request.data.get('is_delivery_confirmed') and order.status != 'delivered':
            order.is_delivery_confirmed = True
            order.status = 'delivered'
            order.save()
            points = int(order.total_amount) // 500
            if points > 0:
                order.user.loyalty_points += points
                order.user.save(update_fields=['loyalty_points'])
            create_order_notification(order, 'delivered')
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
            was_delivered = order.status == 'delivered'
            order.status = new_status
            if new_status == 'delivered':
                order.is_delivery_confirmed = True
            order.save()
            create_order_notification(order, new_status)
            if new_status == 'delivered' and not was_delivered:
                points = int(order.total_amount) // 500
                if points > 0:
                    order.user.loyalty_points += points
                    order.user.save(update_fields=['loyalty_points'])
        return Response(OrderSerializer(order).data)


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)[:30]
        unread = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({
            'results': NotificationSerializer(qs, many=True).data,
            'unread':  unread,
        })

    def patch(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'ok': True})


@method_decorator(csrf_exempt, name='dispatch')
class CampayWebhookView(View):
    """
    Webhook appelé par Campay après confirmation du paiement mobile.
    Campay POST : { status, external_reference, reference, amount, ... }
    """
    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return HttpResponse(status=400)

        ext_ref       = data.get('external_reference', '')
        campay_status = data.get('status', '')

        if ext_ref and campay_status == 'SUCCESSFUL':
            try:
                order = Order.objects.get(payment_reference=ext_ref, status='pending')
                order.status = 'paid'
                order.save(update_fields=['status'])
                create_order_notification(order, 'paid')
            except Order.DoesNotExist:
                pass

        return HttpResponse(status=200)


# ── Commandes sur-mesure ─────────────────────────────────────────────
from .models import CustomOrder
from apps.products.models import Product as ProductModel
from rest_framework import serializers as drf_serializers


class CustomOrderSerializer(drf_serializers.ModelSerializer):
    client_name   = drf_serializers.SerializerMethodField()
    producer_name = drf_serializers.SerializerMethodField()
    product_name  = drf_serializers.SerializerMethodField()
    product       = drf_serializers.PrimaryKeyRelatedField(
        queryset=ProductModel.objects.all(), allow_null=True, required=False
    )
    budget        = drf_serializers.DecimalField(
        max_digits=10, decimal_places=0, allow_null=True, required=False
    )

    class Meta:
        model  = CustomOrder
        fields = [
            'id', 'client_name', 'producer_name',
            'product', 'product_name',
            'description', 'budget', 'quantity',
            'status', 'estimated_price', 'artisan_note',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'client_name', 'producer_name', 'product_name',
            'status', 'estimated_price', 'artisan_note',
            'created_at', 'updated_at',
        ]

    def get_client_name(self, obj):
        return obj.client.first_name or obj.client.username

    def get_producer_name(self, obj):
        return obj.producer.first_name or obj.producer.username

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None


class CustomOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'producer':
            qs = CustomOrder.objects.filter(
                producer=user
            ).select_related('client', 'producer', 'product')
        else:
            qs = CustomOrder.objects.filter(
                client=user
            ).select_related('client', 'producer', 'product')
        return Response(CustomOrderSerializer(qs, many=True).data)

    def post(self, request):
        from apps.users.models import User as UserModel

        producer_id = request.data.get('producer_id')
        if not producer_id:
            return Response({'error': 'producer_id requis.'}, status=400)

        try:
            producer = UserModel.objects.get(id=producer_id, role='producer')
        except UserModel.DoesNotExist:
            return Response({'error': 'Artisan introuvable.'}, status=400)

        if request.user.id == producer.id:
            return Response({'error': 'Action non autorisée.'}, status=400)

        serializer = CustomOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        obj = serializer.save(client=request.user, producer=producer)

        Notification.objects.create(
            user    = producer,
            type    = 'new_order',
            title   = 'Nouvelle demande sur-mesure',
            message = (
                f'{request.user.first_name or request.user.username} '
                f'vous a envoyé une demande de création sur-mesure.'
            ),
        )
        return Response(CustomOrderSerializer(obj).data, status=201)


class CustomOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            obj = CustomOrder.objects.get(pk=pk)
        except CustomOrder.DoesNotExist:
            return Response(status=404)

        user = request.user
        if user.role != 'producer' or obj.producer_id != user.id:
            return Response({'error': 'Non autorisé.'}, status=403)

        allowed = {'status', 'estimated_price', 'artisan_note'}
        for k, v in request.data.items():
            if k in allowed:
                setattr(obj, k, v)

        if obj.status not in ('pending', 'accepted', 'declined', 'completed'):
            return Response({'error': 'Statut invalide.'}, status=400)

        obj.save()
        Notification.objects.create(
            user    = obj.client,
            type    = 'new_order',
            title   = 'Réponse à votre demande sur-mesure',
            message = (
                f'Votre demande a été '
                f'{obj.get_status_display().lower()} par l\'artisan.'
            ),
        )
        return Response(CustomOrderSerializer(obj).data)
