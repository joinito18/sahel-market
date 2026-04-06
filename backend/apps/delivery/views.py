from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DeliveryTracking
from apps.orders.models import Order

class TrackingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            tracking = DeliveryTracking.objects.get(order=order)
            return Response({
                'order_id': order.id,
                'status': order.status,
                'latitude': tracking.latitude,
                'longitude': tracking.longitude,
                'last_updated': tracking.last_updated,
            })
        except (Order.DoesNotExist, DeliveryTracking.DoesNotExist):
            return Response({'error': 'Suivi introuvable.'}, status=404)