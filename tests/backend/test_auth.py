from django.test import TestCase
from django.contrib.auth.models import User

class AuthIntegrationTests(TestCase):
    def test_user_creation_and_auth(self):
        user = User.objects.create_user(username='tester', email='tester@smartcart.com', password='password123')
        self.assertEqual(user.username, 'tester')
        self.assertTrue(user.check_password('password123'))
