from rest_framework import serializers
from .models import Product, ProductImage
from apps.categories.serializers import CategorySerializer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary')

class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_details', 'name', 'slug', 'sku',
            'description', 'price', 'discount_price', 'current_price',
            'stock', 'is_in_stock', 'rating_avg', 'reviews_count',
            'is_active', 'images', 'created_at'
        )

ProductListSerializer = ProductSerializer

