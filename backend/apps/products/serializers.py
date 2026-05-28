from rest_framework import serializers
from .models import Product, Category, ProductImage, Rating, Like, StockAlert, ProductVariant

class ProductVariantSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model  = ProductVariant
        fields = ['id', 'type', 'type_label', 'label', 'extra_price', 'stock']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class RatingSerializer(serializers.ModelSerializer):
    user_name            = serializers.CharField(source='user.username', read_only=True)
    is_verified_purchase = serializers.SerializerMethodField()
    photo_url            = serializers.SerializerMethodField()

    class Meta:
        model  = Rating
        fields = ['id', 'user_name', 'score', 'comment', 'photo', 'photo_url', 'created_at', 'is_verified_purchase']
        read_only_fields = ['id', 'user_name', 'created_at', 'is_verified_purchase', 'photo_url']
        extra_kwargs = {'photo': {'write_only': True, 'required': False}}

    def get_is_verified_purchase(self, obj):
        from apps.orders.models import OrderItem
        return OrderItem.objects.filter(
            order__user=obj.user, product=obj.product,
        ).exists()

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        return None

class ProductListSerializer(serializers.ModelSerializer):
    main_image           = serializers.SerializerMethodField()
    second_image         = serializers.SerializerMethodField()
    average_rating       = serializers.FloatField(read_only=True)
    ratings_count        = serializers.IntegerField(source='ratings.count', read_only=True)
    likes_count          = serializers.IntegerField(source='likes.count', read_only=True)
    producer_name        = serializers.CharField(source='producer.username', read_only=True)
    producer_id          = serializers.IntegerField(source='producer.id', read_only=True)
    producer_is_verified = serializers.BooleanField(source='producer.is_verified', read_only=True)
    category             = CategorySerializer(read_only=True)
    is_liked             = serializers.SerializerMethodField()
    is_flash_active      = serializers.BooleanField(read_only=True)
    user_has_alert       = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'location', 'is_available',
                  'main_image', 'second_image', 'average_rating', 'ratings_count', 'likes_count',
                  'producer_name', 'producer_id', 'producer_is_verified', 'category',
                  'views_count', 'created_at', 'is_liked',
                  'flash_price', 'flash_end', 'is_flash_active', 'user_has_alert']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_user_has_alert(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.alerts.filter(user=request.user, notified=False).exists()
        return False

    def get_main_image(self, obj):
        img = obj.images.filter(is_main=True).first() or obj.images.first()
        return img.image.url if img else None

    def get_second_image(self, obj):
        main = obj.images.filter(is_main=True).first()
        if main:
            second = obj.images.exclude(id=main.id).first()
        else:
            imgs = list(obj.images.all())
            second = imgs[1] if len(imgs) >= 2 else None
        return second.image.url if second else None

class ProductDetailSerializer(ProductListSerializer):
    images       = ProductImageSerializer(many=True, read_only=True)
    ratings      = RatingSerializer(many=True, read_only=True)
    variants     = ProductVariantSerializer(many=True, read_only=True)
    user_rating  = serializers.SerializerMethodField()
    user_comment = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            'description', 'images', 'ratings', 'variants', 'user_rating', 'user_comment',
        ]

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            r = obj.ratings.filter(user=request.user).first()
            return r.score if r else None
        return None

    def get_user_comment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            r = obj.ratings.filter(user=request.user).first()
            return r.comment if r else ''
        return ''

class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    producer_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock', 'location', 'category', 'images', 'producer_id']

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        validated_data.pop('producer_id', None)
        product = Product.objects.create(**validated_data)
        for i, img in enumerate(images):
            ProductImage.objects.create(product=product, image=img, is_main=(i == 0))
        return product