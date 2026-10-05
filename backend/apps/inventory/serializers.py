from rest_framework import serializers
from .models import InventoryLog
from apps.products.models import Product

class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ('id', 'product', 'product_name', 'product_sku', 'change_amount', 'reason', 'resulting_stock', 'logged_at')

class AdjustStockSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity_change = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=True)

class DynamicPricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import DynamicPricingRule
        model = DynamicPricingRule
        fields = ('id', 'name', 'rule_type', 'min_stock_threshold', 'max_stock_threshold', 'price_adjustment_pct', 'is_active', 'created_at')

