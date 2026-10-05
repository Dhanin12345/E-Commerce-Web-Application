from rest_framework import serializers
from .models import PriceAlert, StockAlert
from apps.products.serializers import ProductListSerializer

class PriceAlertSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = PriceAlert
        fields = ('id', 'product', 'product_details', 'target_price', 'is_active', 'notified_at', 'created_at')
        read_only_fields = ('id', 'notified_at', 'created_at')

class StockAlertSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    class Meta:
        model = StockAlert
        fields = ('id', 'product', 'product_details', 'email', 'is_active', 'notified_at', 'created_at')
        read_only_fields = ('id', 'notified_at', 'created_at')
