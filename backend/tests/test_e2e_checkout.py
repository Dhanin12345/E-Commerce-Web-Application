from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from apps.categories.models import Category
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from apps.orders.services import OrderService
from apps.payments.services import PaymentService
from apps.orders.models import OrderStatus

class EndToEndCheckoutIntegrationTest(TestCase):
    def test_complete_checkout_and_payment_flow(self):
        user = User.objects.create_user(username='customer1', email='cust@smartcart.com', password='password123')
        category = Category.objects.create(name='Gadgets', slug='gadgets')
        product = Product.objects.create(
            category=category,
            name='Noise Cancelling Headphones',
            slug='nc-headphones',
            sku='HD-100',
            description='Wireless headphones',
            price=199.99,
            stock=10
        )

        # 1. Add to cart
        cart, _ = Cart.objects.get_or_create(user=user)
        CartItem.objects.create(cart=cart, product=product, quantity=1)

        # 2. Convert cart to order
        order = OrderService.create_order_from_cart(user=user, shipping_address='456 Pine Ave, Seattle, WA')
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertEqual(order.total_amount, Decimal('199.99'))

        # 3. Process payment
        payment = PaymentService.process_payment(order=order, payment_method='CREDIT_CARD')
        order.refresh_from_db()
        self.assertEqual(order.status, OrderStatus.PAID)
        self.assertEqual(payment.status, 'COMPLETED')
