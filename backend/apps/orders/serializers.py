from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'unit_price', 'quantity', 'subtotal')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'subtotal', 'discount_amount',
            'shipping_cost', 'total_amount', 'shipping_address',
            'tracking_number', 'items', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'order_number', 'created_at', 'updated_at')

class CreateOrderRequestSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(required=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class DeliveryShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        from .models import DeliveryShipment
        model = DeliveryShipment
        fields = ('id', 'order', 'order_number', 'courier_name', 'tracking_code', 'current_status', 'current_location', 'estimated_delivery_date', 'updated_at')

class OrderReturnSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        from .models import OrderReturn
        model = OrderReturn
        fields = ('id', 'order', 'order_number', 'user', 'user_name', 'reason', 'status', 'refund_amount', 'admin_response', 'created_at', 'updated_at')
        read_only_fields = ('id', 'order_number', 'user', 'user_name', 'created_at', 'updated_at')

