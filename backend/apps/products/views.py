from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Avg, Count, Q
from .models import Product, Category, Rating, Like, StockAlert
from .serializers import (ProductListSerializer, ProductDetailSerializer,
                           ProductCreateSerializer, CategorySerializer, RatingSerializer)
from apps.users.models import User
from apps.orders.models import Order, OrderItem
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class OptionalJWTAuthentication(JWTAuthentication):
    """JWT auth that gracefully handles invalid/expired tokens on public endpoints.
    Instead of raising 401, silently treats the request as anonymous."""
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            return None


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
    authentication_classes = [OptionalJWTAuthentication]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'is_available', 'producer']
    ordering_fields  = ['price', 'created_at', 'views_count']

    def get_queryset(self):
        qs         = super().get_queryset()
        location   = self.request.query_params.get('location')
        price_min  = self.request.query_params.get('price_min')
        price_max  = self.request.query_params.get('price_max')
        min_rating = self.request.query_params.get('min_rating')
        search     = self.request.query_params.get('search', '').strip()

        if location:   qs = qs.filter(location__icontains=location)
        if price_min:  qs = qs.filter(price__gte=price_min)
        if price_max:  qs = qs.filter(price__lte=price_max)
        if min_rating: qs = qs.annotate(avg_r=Avg('ratings__score')).filter(avg_r__gte=float(min_rating))

        if search:
            try:
                from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
                query  = SearchQuery(search, config='french')
                vector = (
                    SearchVector('name',        weight='A', config='french') +
                    SearchVector('description', weight='B', config='french') +
                    SearchVector('location',    weight='C', config='french')
                )
                qs = (qs.annotate(rank=SearchRank(vector, query))
                        .filter(rank__gte=0.01)
                        .order_by('-rank'))
            except Exception:
                qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        return qs

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def recommendations(self, request, pk=None):
        """
        Retourne jusqu'à 6 produits recommandés en combinant :
        1. Co-achats collaboratifs (achetés ensemble par d'autres utilisateurs)
        2. Même catégorie, triés par popularité
        3. Même artisan, triés par popularité
        """
        product = self.get_object()
        recommended = []

        # ── Stratégie 1 : co-achat collaboratif ──────────────────────
        buyer_ids = (OrderItem.objects
                     .filter(product=product)
                     .values_list('order__user_id', flat=True))

        if buyer_ids.exists():
            co_bought = (
                Product.objects
                .filter(orderitems__order__user_id__in=buyer_ids, is_available=True)
                .exclude(id=product.id)
                .annotate(score=Count('id'))
                .order_by('-score')
                .select_related('producer', 'category')
                .prefetch_related('images', 'ratings', 'likes')[:4]
            )
            recommended = list(co_bought)

        # ── Stratégie 2 : même catégorie + populaires ────────────────
        needed = 6 - len(recommended)
        if needed > 0 and product.category:
            already = [product.id] + [p.id for p in recommended]
            same_cat = (
                Product.objects
                .filter(category=product.category, is_available=True)
                .exclude(id__in=already)
                .order_by('-views_count')
                .select_related('producer', 'category')
                .prefetch_related('images', 'ratings', 'likes')[:needed]
            )
            recommended += list(same_cat)

        # ── Stratégie 3 : même artisan ───────────────────────────────
        needed = 6 - len(recommended)
        if needed > 0:
            already = [product.id] + [p.id for p in recommended]
            same_producer = (
                Product.objects
                .filter(producer=product.producer, is_available=True)
                .exclude(id__in=already)
                .order_by('-views_count')
                .select_related('producer', 'category')
                .prefetch_related('images', 'ratings', 'likes')[:needed]
            )
            recommended += list(same_producer)

        serializer = ProductListSerializer(
            recommended[:6], many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def locations(self, request):
        locs = (
            Product.objects.exclude(location='')
            .filter(is_available=True)
            .values_list('location', flat=True)
            .distinct()
            .order_by('location')
        )
        return Response(sorted(set(locs)))

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
    def alert(self, request, pk=None):
        """S'abonner / se désabonner à l'alerte de réapprovisionnement."""
        product = self.get_object()
        if product.stock > 0:
            return Response({'error': 'Ce produit est déjà disponible.'}, status=status.HTTP_400_BAD_REQUEST)
        alert_obj, created = StockAlert.objects.get_or_create(
            product=product, user=request.user,
            defaults={'notified': False},
        )
        if not created:
            alert_obj.delete()
            return Response({'subscribed': False})
        return Response({'subscribed': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def flash(self, request):
        """Produits en vente flash actifs."""
        from django.utils import timezone
        qs = (Product.objects
              .filter(flash_price__isnull=False, flash_end__gt=timezone.now(), is_available=True)
              .select_related('producer', 'category')
              .prefetch_related('images', 'ratings', 'likes'))
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)

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
    authentication_classes = []


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
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