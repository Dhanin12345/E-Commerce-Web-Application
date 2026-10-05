from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem, OrderStatus
from apps.cart.models import Cart
from apps.products.models import Product

class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order_from_cart(user, shipping_address, discount_amount=Decimal('0.00'), shipping_cost=Decimal('0.00')):
        cart = Cart.objects.prefetch_related('items__product').get(user=user)
        if not cart.items.exists():
            raise ValueError("Cannot create an order from an empty cart.")

        # Validate stock availability
        for item in cart.items.all():
            if item.product.stock < item.quantity:
                raise ValueError(f"Insufficient stock for {item.product.name}. Available: {item.product.stock}")

        subtotal = cart.total_price
        total_amount = max(Decimal('0.00'), (subtotal - discount_amount) + shipping_cost)

        order = Order.objects.create(
            user=user,
            status=OrderStatus.PENDING,
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            shipping_address=shipping_address
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                unit_price=item.product.current_price,
                quantity=item.quantity,
                subtotal=item.subtotal
            )
            # Decrement inventory stock
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        # Clear cart
        cart.items.all().delete()
        return order
