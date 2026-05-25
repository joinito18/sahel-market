import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
from apps.users.models import User
from apps.orders.models import Order, OrderItem
from apps.products.models import Product

class IsAdminOrAgent(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['admin', 'agent']

class GlobalDashboardView(APIView):
    permission_classes = [IsAdminOrAgent]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_sales = Order.objects.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0
        monthly_sales = Order.objects.filter(
            status='delivered', created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        return Response({
            'total_sales': total_sales,
            'monthly_sales': monthly_sales,
            'total_users': User.objects.count(),
            'active_clients': User.objects.filter(role='client', is_active=True).count(),
            'total_producers': User.objects.filter(role='producer').count(),
            'total_products': Product.objects.count(),
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'disputes': Order.objects.filter(status='cancelled').count(),
        })

class ProducerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['producer', 'admin']:
            return Response({'error': 'Accès refusé.'}, status=403)

        now = timezone.now()
        products = Product.objects.filter(producer=request.user)
        order_items = OrderItem.objects.filter(
            product__producer=request.user,
            order__status='delivered'
        )
        revenue = sum(item.subtotal for item in order_items)

        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        weekly_items = OrderItem.objects.filter(
            product__producer=request.user,
            order__status='delivered',
            order__updated_at__gte=week_ago,
        )
        monthly_items = OrderItem.objects.filter(
            product__producer=request.user,
            order__status='delivered',
            order__updated_at__gte=month_ago,
        )
        weekly_revenue  = sum(i.subtotal for i in weekly_items)
        monthly_revenue = sum(i.subtotal for i in monthly_items)
        weekly_orders   = weekly_items.values('order').distinct().count()

        low_stock = [
            {'id': p.id, 'name': p.name, 'stock': p.stock}
            for p in products if p.stock <= 3
        ]

        return Response({
            'products_count': products.count(),
            'low_stock_products': low_stock,
            'total_views':    sum(p.views_count for p in products),
            'revenue':        revenue,
            'orders_count':   order_items.values('order').distinct().count(),
            'weekly_revenue':  weekly_revenue,
            'monthly_revenue': monthly_revenue,
            'weekly_orders':   weekly_orders,
            'products': [
                {'id': p.id, 'name': p.name, 'stock': p.stock,
                 'views': p.views_count, 'is_available': p.is_available}
                for p in products
            ],
        })


class ProducerExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['producer', 'admin']:
            return HttpResponse(status=403)

        items = OrderItem.objects.filter(
            product__producer=request.user,
            order__status='delivered',
        ).select_related('order', 'order__user', 'product').order_by('-order__created_at')

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="ventes_sahel_market.csv"'
        response.write('﻿')  # BOM UTF-8 pour Excel

        writer = csv.writer(response, delimiter=';')
        writer.writerow([
            'Date commande', 'N° commande', 'Produit',
            'Quantité', 'Prix unitaire (FCFA)', 'Sous-total (FCFA)',
            'Client', 'Ville de livraison',
        ])
        for item in items:
            writer.writerow([
                item.order.created_at.strftime('%d/%m/%Y'),
                f'CMD-{item.order.id}',
                item.product_name,
                item.quantity,
                int(item.unit_price),
                int(item.subtotal),
                item.order.user.username,
                item.order.delivery_address[:50] if item.order.delivery_address else '',
            ])
        return response


STATUS_LABELS = {
    'pending':    'En attente',
    'paid':       'Payée',
    'processing': 'En préparation',
    'shipped':    'Expédiée',
    'delivered':  'Livrée',
    'cancelled':  'Annulée',
}

class ProducerOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['producer', 'admin']:
            return Response({'error': 'Accès refusé.'}, status=403)

        orders = (
            Order.objects
            .filter(items__product__producer=request.user)
            .distinct()
            .select_related('user')
            .prefetch_related('items__product')
            .order_by('-created_at')[:60]
        )

        result = []
        for order in orders:
            my_items = [
                {
                    'product_name': item.product_name,
                    'quantity':     item.quantity,
                    'unit_price':   int(item.unit_price),
                    'subtotal':     int(item.subtotal),
                }
                for item in order.items.filter(product__producer=request.user)
            ]
            result.append({
                'id':               order.id,
                'status':           order.status,
                'status_label':     STATUS_LABELS.get(order.status, order.status),
                'created_at':       order.created_at,
                'client':           order.user.first_name or order.user.username,
                'delivery_address': order.delivery_address,
                'payment_method':   order.payment_method,
                'items':            my_items,
                'my_total':         sum(i['subtotal'] for i in my_items),
            })

        return Response(result)