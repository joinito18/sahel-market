from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
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

        products = Product.objects.filter(producer=request.user)
        order_items = OrderItem.objects.filter(
            product__producer=request.user,
            order__status='delivered'
        )
        revenue = sum(item.subtotal for item in order_items)

        return Response({
            'products_count': products.count(),
            'total_views': sum(p.views_count for p in products),
            'revenue': revenue,
            'orders_count': order_items.values('order').distinct().count(),
            'products': [
                {'id': p.id, 'name': p.name, 'stock': p.stock,
                 'views': p.views_count, 'is_available': p.is_available}
                for p in products
            ],
        })