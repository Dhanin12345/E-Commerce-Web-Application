import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Payment'
    PAID = 'PAID', 'Payment Received'
    PROCESSING = 'PROCESSING', 'Processing in Warehouse'
    SHIPPED = 'SHIPPED', 'Shipped with Courier'
    DELIVERED = 'DELIVERED', 'Delivered'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Order(models.Model):
    order_number = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} ({self.status}) - ${self.total_amount}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"


class ShipmentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Assignment'
    ASSIGNED = 'ASSIGNED', 'Assigned to Courier'
    PICKED_UP = 'PICKED_UP', 'Picked Up'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
    DELIVERED = 'DELIVERED', 'Delivered'
    FAILED = 'FAILED', 'Delivery Attempt Failed'


class DeliveryShipment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_shipment')
    courier_name = models.CharField(max_length=100, default='SmartCart Express')
    tracking_code = models.CharField(max_length=64, unique=True)
    current_status = models.CharField(max_length=30, choices=ShipmentStatus.choices, default=ShipmentStatus.PENDING)
    current_location = models.CharField(max_length=255, default='Central Warehouse, Hub 1')
    estimated_delivery_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment for {self.order.order_number}: {self.current_status} ({self.tracking_code})"


class ReturnStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Return Requested'
    APPROVED = 'APPROVED', 'Return Approved'
    REJECTED = 'REJECTED', 'Return Rejected'
    REFUNDED = 'REFUNDED', 'Refund Completed'


class OrderReturn(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_returns')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=ReturnStatus.choices, default=ReturnStatus.REQUESTED)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    admin_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Return #{self.id} for Order {self.order.order_number} ({self.status})"

