from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.nextgen.models import (
    FeatureFlag, Supplier, PurchaseOrder, PurchaseOrderItem,
    Warehouse, WarehouseStock, ARProductAsset, ProductBundle,
    ProductCollection, Subscription, UserPrivacyPreference, AuditLog,
    AIModelMetric
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed next-generation smart e-commerce records (Flags, Suppliers, Bundles, AR, Warehouses, etc.)"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding SmartCart Next-Gen modular data...")

        # 1. Feature Flags
        flags = [
            ('AI_COPILOT', 'AI Shopping Copilot', True, 'Natural language intent-based shopping assistant'),
            ('VISUAL_SEARCH', 'Visual Product Search', True, 'Image upload and similarity search engine'),
            ('AR_PREVIEW', 'AR / 3D Virtual Preview', True, 'Augmented reality 3D placement viewer'),
            ('SMART_BUNDLES', 'Smart Product Bundles', True, 'Automated Complete Your Setup product bundles'),
            ('CART_OPTIMIZER', 'Smart Cart Optimization', True, 'Real-time free shipping threshold and accessory upsells'),
            ('SUBSCRIPTIONS', 'Subscribe & Save', True, 'Recurring subscription intervals with 10% discount'),
            ('MULTI_WAREHOUSE', 'Multi-Warehouse Inventory Routing', True, 'Regional fulfillment and order splitting'),
            ('COLLABORATIVE_ADMIN', 'Real-Time Admin Event Stream', True, 'Live operational WebSocket/SSE event broadcast'),
            ('PRIVACY_CENTER', 'Customer Privacy Center & Data Export', True, 'Self-service GDPR/CCPA data export'),
        ]
        for key, name, enabled, desc in flags:
            FeatureFlag.objects.get_or_create(
                key=key,
                defaults={'name': name, 'is_enabled': enabled, 'description': desc}
            )

        # 2. Suppliers
        s1, _ = Supplier.objects.get_or_create(
            code='SUP-TECH-01',
            defaults={
                'name': 'Apex Silicon & Tech Supplies',
                'contact_email': 'procurement@apexsilicon.com',
                'phone': '+91 80 4455 6677',
                'lead_time_days': 4,
                'moq': 15,
                'status': 'ACTIVE'
            }
        )
        s2, _ = Supplier.objects.get_or_create(
            code='SUP-AUDIO-02',
            defaults={
                'name': 'Acoustic Labs International',
                'contact_email': 'sales@acousticlabs.io',
                'phone': '+91 22 8899 0011',
                'lead_time_days': 6,
                'moq': 20,
                'status': 'ACTIVE'
            }
        )

        # 3. Warehouses
        w_mum, _ = Warehouse.objects.get_or_create(
            code='WH-MUM-01',
            defaults={
                'name': 'Mumbai Central Distribution Center',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'pincode_prefix': '40',
                'capacity': 25000,
                'is_active': True
            }
        )
        w_blr, _ = Warehouse.objects.get_or_create(
            code='WH-BLR-02',
            defaults={
                'name': 'Bengaluru High-Tech Logistics Depot',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'country': 'India',
                'pincode_prefix': '56',
                'capacity': 30000,
                'is_active': True
            }
        )

        # 4. Warehouse Stock Allocations
        products = list(Product.objects.filter(is_active=True))
        for p in products:
            WarehouseStock.objects.get_or_create(
                warehouse=w_mum,
                product=p,
                defaults={'quantity': max(10, p.stock // 2), 'reserved_quantity': 2}
            )
            WarehouseStock.objects.get_or_create(
                warehouse=w_blr,
                product=p,
                defaults={'quantity': max(10, p.stock - (p.stock // 2)), 'reserved_quantity': 1}
            )

        # 5. Smart Product Bundles
        if len(products) >= 3:
            b1, _ = ProductBundle.objects.get_or_create(
                slug='ultimate-productivity-pack',
                defaults={
                    'name': 'Ultimate Productivity & Workspace Pack',
                    'description': 'Elevate your daily flow with high-performance laptop, wireless ergonomic mouse, and protection sleeve.',
                    'discount_pct': Decimal('15.00'),
                    'is_approved': True,
                    'is_active': True
                }
            )
            b1.products.set(products[:3])

        if len(products) >= 4:
            b2, _ = ProductBundle.objects.get_or_create(
                slug='audio-creators-bundle',
                defaults={
                    'name': 'Studio Sound & Audio Bundle',
                    'description': 'Studio-grade acoustics and high fidelity listening bundle at exclusive package pricing.',
                    'discount_pct': Decimal('20.00'),
                    'is_approved': True,
                    'is_active': True
                }
            )
            b2.products.set(products[2:4])

        # 6. AR 3D Assets
        for p in products[:3]:
            ARProductAsset.objects.get_or_create(
                product=p,
                defaults={
                    'model_url': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
                    'usdz_url': 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz',
                    'placement_type': 'table',
                    'is_ar_enabled': True,
                    'scale': '1 1 1'
                }
            )

        # 7. Sample Purchase Order
        if products:
            po, created = PurchaseOrder.objects.get_or_create(
                po_number='PO-RESTOCK-2026-001',
                defaults={
                    'supplier': s1,
                    'status': 'ORDERED',
                    'expected_delivery': date.today() + timedelta(days=5),
                    'notes': 'Quarterly inventory replenishment for bestselling categories.'
                }
            )
            if created:
                PurchaseOrderItem.objects.create(
                    purchase_order=po,
                    product=products[0],
                    quantity=50,
                    unit_cost=Decimal('45.00')
                )

        # 8. User Privacy & Subscriptions
        user = User.objects.filter(is_staff=False).first() or User.objects.first()
        if user:
            UserPrivacyPreference.objects.get_or_create(
                user=user,
                defaults={
                    'analytics_consent': True,
                    'marketing_emails': True,
                    'personalized_recommendations': True,
                    'data_retention_days': 365
                }
            )
            if products:
                Subscription.objects.get_or_create(
                    user=user,
                    product=products[0],
                    defaults={
                        'billing_interval': 'MONTHLY',
                        'status': 'ACTIVE',
                        'next_billing_date': date.today() + timedelta(days=28),
                        'discount_pct': Decimal('10.00'),
                        'quantity': 1
                    }
                )

            # Collections
            c1, _ = ProductCollection.objects.get_or_create(
                slug='home-office-essentials',
                defaults={
                    'creator': user,
                    'name': 'Home Office & Deep Work Essentials',
                    'description': 'Curated essentials for productivity, ergonomics, and seamless remote work.',
                    'visibility': 'PUBLIC',
                    'views_count': 142
                }
            )
            c1.products.set(products[:4])

        # 9. Audit Logs
        admin_user = User.objects.filter(is_staff=True).first()
        AuditLog.objects.create(
            user=admin_user,
            action='UPDATE_FEATURE_FLAG',
            target_model='FeatureFlag',
            target_id='AI_COPILOT',
            details={'old_value': False, 'new_value': True, 'reason': 'Enabled SmartCart Copilot v2 in production'}
        )
        AuditLog.objects.create(
            user=admin_user,
            action='APPROVE_PRODUCT_BUNDLE',
            target_model='ProductBundle',
            target_id='ultimate-productivity-pack',
            details={'discount_approved': '15.0%'}
        )

        # 10. AI Model Metrics
        AIModelMetric.objects.create(
            model_name='smartcart-copilot-v2',
            endpoint='copilot.chat',
            latency_ms=115,
            tokens_or_items=4,
            success=True
        )

        self.stdout.write(self.style.SUCCESS("SmartCart Next-Gen features successfully seeded!"))
