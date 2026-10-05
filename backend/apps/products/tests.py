from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Product
from apps.categories.models import Category

class ProductTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Smart Keyboard',
            slug='smart-keyboard',
            sku='KB-001',
            description='Wireless RGB Keyboard',
            price=99.99,
            stock=10
        )
        self.list_url = reverse('product_list_create')

    def test_list_products(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_search_product(self):
        response = self.client.get(self.list_url, {'search': 'Smart'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['name'], 'Smart Keyboard')
