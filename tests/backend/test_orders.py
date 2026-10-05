from django.test import TestCase
from django.contrib.auth.models import User
from apps.categories.models import Category
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from apps.orders.services import OrderService

class OrderWorkflowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', email='buyer@example.com', password='password123')
        self.category = Category.objects.create(name='Tech', slug='tech')
        self.product = Product.objects.create(
            category=self.category,
            name='USB-C Hub',
            slug='usbc-hub',
            sku='HUB-001',
            description='Multi-port adapter',
            price=29.99,
            stock=5
        )
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    def test_order_creation_decrements_stock(self):
        order = OrderService.create_order_from_cart(
            user=self.user,
            shipping_address='789 Oak St, Austin, TX'
        )
        self.product.refresh_from_db()
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(self.product.stock, 3)
