from rest_framework import serializers
from .models import LoyaltyAccount, LoyaltyTransaction

class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = ('id', 'points', 'transaction_type', 'description', 'created_at')

class LoyaltyAccountSerializer(serializers.ModelSerializer):
    transactions = LoyaltyTransactionSerializer(many=True, read_only=True)
    dollar_value = serializers.SerializerMethodField()

    class Meta:
        model = LoyaltyAccount
        fields = ('id', 'points_balance', 'lifetime_earned', 'tier', 'dollar_value', 'transactions', 'updated_at')

    def get_dollar_value(self, obj):
        # 100 points = $10.00
        return round(obj.points_balance * 0.10, 2)
