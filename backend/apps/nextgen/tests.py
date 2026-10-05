from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.categories.models import Category
from apps.cart.models import Cart, CartItem
from apps.nextgen.models import FeatureFlag, ProductBundle, Supplier, PurchaseOrder
from apps.nextgen.services import (
    CopilotService, VisualSearchService, SmartCartOptimizerService,
    CustomerLifecycleService, SmartInventoryAutomationService
)

User = get_user_model()


class NextGenModularTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Computers', slug='computers')
        self.product = Product.objects.create(
            sku='SKU-PRO-DEV-16',
            name='Pro Developer Laptop 16',
            slug='pro-dev-laptop-16',
            description='Ultimate machine for programming and software engineering.',
            price=Decimal('1200.00'),
            category=self.category,
            stock=14,
            rating_avg=Decimal('4.8'),
            is_active=True
        )
        self.accessory = Product.objects.create(
            sku='SKU-ERGO-MOUSE-01',
            name='Ergonomic Optical Mouse',
            slug='ergo-optical-mouse',
            description='Wireless rechargeable mouse',
            price=Decimal('35.00'),
            category=self.category,
            stock=25,
            rating_avg=Decimal('4.6'),
            is_active=True
        )
        self.customer = User.objects.create_user(username='nextgen_user', password='Password123!', email='nextgen@smartcart.local')
        self.admin = User.objects.create_superuser(username='nextgen_admin', password='Password123!', email='admin@smartcart.local')

    def test_copilot_intent_and_criteria_extraction(self):
        """Test AI Copilot natural language processing & catalog grounding."""
        res = CopilotService.process_query("Find a laptop for programming under 1500", user=self.customer)
        self.assertEqual(res['intent'], 'search')
        self.assertIn('laptop', res['extracted_criteria']['categories'])
        self.assertEqual(res['extracted_criteria']['max_price'], 1500.0)
        self.assertTrue(len(res['products']) >= 1)
        self.assertEqual(res['products'][0]['id'], self.product.id)

    def test_visual_search_similarity(self):
        """Test visual product search ranking and threshold."""
        res = VisualSearchService.search_by_image(None, filename="sample_laptop_photo.png")
        self.assertTrue(res['success'])
        self.assertTrue(len(res['results']) >= 1)
        self.assertTrue(res['results'][0]['similarity_score'] >= 70.0)

    def test_cart_optimizer(self):
        """Test cart free shipping threshold calculation and accessory recommendations."""
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.accessory, quantity=1)  # $35
        
        opt = SmartCartOptimizerService.optimize_cart(self.customer)
        self.assertEqual(opt['subtotal'], 35.0)
        self.assertEqual(opt['free_shipping_remaining'], 65.0)
        self.assertFalse(opt['free_shipping_eligible'])
        self.assertTrue(len(opt['suggested_accessories']) >= 1)

    def test_customer_lifecycle_engine(self):
        """Test customer classification into behavioral buckets."""
        data = CustomerLifecycleService.get_lifecycle_analytics()
        self.assertIn('NEW', data['segments'])
        self.assertIn('ACTIVE', data['segments'])
        self.assertIn('RETURNING', data['segments'])
        self.assertIn('INACTIVE', data['segments'])

    def test_inventory_automation_depletion_estimate(self):
        """Test inventory velocity and days remaining estimation."""
        recs = SmartInventoryAutomationService.get_inventory_recommendations()
        self.assertTrue(len(recs) >= 1)
        self.assertIn('status', recs[0])
        self.assertIn('action_recommendation', recs[0])

    def test_feature_flags_api(self):
        """Test feature flags retrieval and public endpoint."""
        FeatureFlag.objects.create(key='TEST_FLAG', name='Test Flag', is_enabled=True)
        res = self.client.get('/api/nextgen/feature-flags/public/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('TEST_FLAG', res.data)

    def test_smart_bundle_add_to_cart(self):
        """Test 1-click bundle addition to shopping cart."""
        bundle = ProductBundle.objects.create(name='Dev Kit Bundle', discount_pct=Decimal('15.00'))
        bundle.products.set([self.product, self.accessory])

        self.client.force_authenticate(user=self.customer)
        res = self.client.post(f'/api/nextgen/bundles/{bundle.id}/add_to_cart/')
        self.assertEqual(res.status_code, 200)
        
        cart = Cart.objects.get(user=self.customer)
        self.assertEqual(cart.items.count(), 2)

    def test_data_privacy_export(self):
        """Test self-service customer data archive export."""
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/nextgen/privacy/export/?format=json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['profile']['username'], 'nextgen_user')
        self.assertIn('orders', res.data)
        self.assertIn('reviews', res.data)

    def test_system_health_dashboard_api(self):
        """Test admin real-time system health dashboard."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/nextgen/system-health/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('services', res.data)
        self.assertIn('database', res.data['services'])
