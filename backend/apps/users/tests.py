from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Address

class UserTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='johndoe', email='john@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        url = reverse('user_profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'johndoe')

    def test_create_address(self):
        url = reverse('user_addresses')
        data = {
            'full_name': 'John Doe',
            'street_address': '123 Market St',
            'city': 'San Francisco',
            'state': 'CA',
            'postal_code': '94105',
            'country': 'USA',
            'phone': '555-0199',
            'is_default': True
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.filter(user=self.user).count(), 1)
