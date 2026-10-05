from rest_framework import serializers
from .models import WishlistItem
from apps.products.serializers import ProductSerializer
from apps.products.models import Product

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ('id', 'product', 'product_id', 'created_at')
