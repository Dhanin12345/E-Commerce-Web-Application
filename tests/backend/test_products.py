from django.test import TestCase
from apps.categories.models import Category
from apps.products.models import Product

class ProductModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Hardware', slug='hardware')
        self.product = Product.objects.create(
            category=self.category,
            name='Ergonomic Mouse',
            slug='ergonomic-mouse',
            sku='MS-01',
            description='Precision wireless mouse',
            price=49.99,
            discount_price=39.99,
            stock=15
        )

    def test_product_pricing_and_stock(self):
        self.assertEqual(self.product.current_price, 39.99)
        self.assertTrue(self.product.is_in_stock)
