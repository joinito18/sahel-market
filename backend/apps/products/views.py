from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product, Category, Rating, Like
from .serializers import (ProductListSerializer, ProductDetailSerializer,
                           ProductCreateSerializer, CategorySerializer, RatingSerializer)
from apps.users.models import User
from apps.orders.models import Order

class IsProducerOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['producer', 'agent', 'admin']

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role in ['agent', 'admin']:
            return True
        return obj.producer == request.user

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('producer', 'category').prefetch_related('images', 'ratings', 'likes')
    permission_classes = [IsProducerOrAgent]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_available', 'producer']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'views_count']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductDetailSerializer

    def perform_create(self, serializer):
        producer = self.request.user
        if self.request.user.role == 'admin':
            producer_id = self.request.data.get('producer_id')
            if producer_id:
                try:
                    producer = User.objects.get(id=producer_id, role='producer')
                except User.DoesNotExist:
                    pass
        serializer.save(producer=producer)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def wishlist(self, request):
        products = Product.objects.filter(likes__user=request.user).select_related(
            'producer', 'category'
        ).prefetch_related('images', 'ratings', 'likes')
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        product = self.get_object()
        like, created = Like.objects.get_or_create(product=product, user=request.user)
        if not created:
            like.delete()
            return Response({'liked': False})
        return Response({'liked': True})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        product = self.get_object()
        serializer = RatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating, created = Rating.objects.update_or_create(
            product=product, user=request.user,
            defaults={'score': serializer.validated_data['score'],
                      'comment': serializer.validated_data.get('comment', '')}
        )
        return Response(RatingSerializer(rating).data)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def platform_stats(request):
    """Chiffres clés affichés sur la homepage — endpoint public."""
    return Response({
        'artisans':  User.objects.filter(role='producer').count(),
        'produits':  Product.objects.filter(is_available=True).count(),
        'categories': Category.objects.count(),
        'commandes': Order.objects.filter(status__in=['paid', 'delivered', 'shipped']).count(),
        'regions':   Product.objects.exclude(location='')
                             .values('location').distinct().count(),
    })