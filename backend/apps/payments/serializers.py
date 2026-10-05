from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'order_number', 'transaction_id', 'payment_method', 'amount', 'status', 'created_at')

class ProcessPaymentRequestSerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    payment_method = serializers.CharField(required=True)
    card_number = serializers.CharField(required=False, write_only=True)
    card_expiry = serializers.CharField(required=False, write_only=True)
    card_cvc = serializers.CharField(required=False, write_only=True)
