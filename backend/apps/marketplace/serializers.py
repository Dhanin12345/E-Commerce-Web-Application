from rest_framework import serializers
from .models import SellerProfile, SellerSettlement

class SellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SellerProfile
        fields = ('id', 'username', 'store_name', 'business_email', 'phone', 'description', 'commission_pct', 'is_approved', 'rating', 'total_sales', 'created_at')
        read_only_fields = ('id', 'is_approved', 'rating', 'total_sales', 'created_at')

class SellerSettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerSettlement
        fields = ('id', 'order_number', 'product_name', 'sale_amount', 'commission_amount', 'net_earnings', 'status', 'created_at')
