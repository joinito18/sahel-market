from rest_framework import serializers
from .models import Product, Category, ProductImage, Rating, Like

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class RatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user_name', 'score', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

class ProductListSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    producer_name = serializers.CharField(source='producer.username', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'location', 'is_available',
                  'main_image', 'average_rating', 'likes_count', 'producer_name',
                  'views_count', 'created_at']

    def get_main_image(self, obj):
        img = obj.images.filter(is_main=True).first() or obj.images.first()
        if img:
            return img.image.url
        return None

class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['description', 'images', 'ratings', 'category']

class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock', 'location', 'category', 'images']

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        product = Product.objects.create(**validated_data)
        for i, img in enumerate(images):
            ProductImage.objects.create(product=product, image=img, is_main=(i == 0))
        return product