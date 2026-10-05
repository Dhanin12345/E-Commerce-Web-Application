from django.test import TestCase
from django.contrib.auth.models import User
from apps.categories.models import Category
from apps.products.models import Product
from apps.recommendations.services import RecommendationService

class RecommendationServiceTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.p1 = Product.objects.create(
            category=self.category, name='Wireless Mouse', slug='mouse', sku='M-1',
            price=29.99, stock=10, rating_avg=4.8, reviews_count=15
        )
        self.p2 = Product.objects.create(
            category=self.category, name='Mechanical Keyboard', slug='keyboard', sku='K-1',
            price=89.99, stock=5, rating_avg=4.6, reviews_count=20
        )

    def test_trending_products(self):
        trending = RecommendationService.get_trending(limit=2)
        self.assertEqual(len(trending), 2)
        self.assertEqual(trending[0].id, self.p2.id) # Higher review count first

    def test_similar_products(self):
        similar = RecommendationService.get_similar(self.p1.id, limit=1)
        self.assertEqual(len(similar), 1)
        self.assertEqual(similar[0].id, self.p2.id)
