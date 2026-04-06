from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.products.models import Product
from .models import AgentProducer
from .serializers import AddProducerSerializer

class IsAgent(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['agent', 'admin']

class ProducerListView(APIView):
    permission_classes = [IsAgent]

    def get(self, request):
        relations = AgentProducer.objects.filter(agent=request.user).select_related('producer')
        producers = [r.producer for r in relations]
        return Response(UserSerializer(producers, many=True).data)

    def post(self, request):
        serializer = AddProducerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        producer, temp_password = serializer.save()
        AgentProducer.objects.create(agent=request.user, producer=producer)
        return Response({
            'producer': UserSerializer(producer).data,
            'temporary_password': temp_password,
            'message': 'Producteur ajouté. Transmets ce mot de passe temporaire.',
        }, status=status.HTTP_201_CREATED)

class StockUpdateView(APIView):
    permission_classes = [IsAgent]

    def patch(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            new_stock = request.data.get('stock')
            if new_stock is not None:
                product.stock = new_stock
                product.is_available = new_stock > 0
                product.save()
            return Response({'id': product.id, 'stock': product.stock})
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)