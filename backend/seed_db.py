import os
import django
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from apps.users.models import UserProfile, Address
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.coupons.models import Coupon
from apps.reviews.models import Review

def run_seed():
    print("🌱 Starting database seeding...")

    # 1. Superuser
    admin_user, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@smartcart.com',
        'first_name': 'Super',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
    })
    if created:
        admin_user.set_password('AdminPass123!')
        admin_user.save()
        print("✓ Created admin user: admin / AdminPass123!")

    # 2. Customer
    cust_user, created = User.objects.get_or_create(username='customer', defaults={
        'email': 'customer@smartcart.com',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'is_staff': False,
    })
    if created:
        cust_user.set_password('CustPass123!')
        cust_user.save()
        Address.objects.create(
            user=cust_user,
            full_name='Jane Doe',
            street_address='742 Evergreen Terrace',
            city='Springfield',
            state='OR',
            postal_code='97477',
            country='USA',
            phone='+1 (555) 234-5678',
            is_default=True,
        )
        print("✓ Created customer user: customer / CustPass123!")

    # 3. Categories
    categories_data = [
        {"name": "Electronics", "slug": "electronics", "desc": "High-performance gadgets, laptops, smartphones, and accessories."},
        {"name": "Audio & Sound", "slug": "audio-sound", "desc": "Premium noise-cancelling headphones, wireless earbuds, and studio speakers."},
        {"name": "Wearables", "slug": "wearables", "desc": "Smart watches, fitness bands, and health tracking wearables."},
        {"name": "Home Office", "slug": "home-office", "desc": "Ergonomic keyboards, 4K monitors, and productivity setups."},
    ]

    cat_map = {}
    for cdata in categories_data:
        cat, _ = Category.objects.get_or_create(
            slug=cdata['slug'],
            defaults={'name': cdata['name'], 'description': cdata['desc']}
        )
        cat_map[cdata['slug']] = cat
    print(f"✓ Seeded {len(cat_map)} categories")

    # 4. Products
    products_data = [
        {
            "cat": "audio-sound",
            "name": "AuraSound Pro Noise-Cancelling Headphones",
            "slug": "aurasound-pro-headphones",
            "sku": "AURA-SND-01",
            "price": Decimal('299.99'),
            "discount_price": Decimal('249.99'),
            "stock": 45,
            "rating_avg": Decimal('4.85'),
            "reviews_count": 128,
            "desc": "Immerse yourself in high-fidelity acoustics with hybrid active noise cancellation, 40-hour battery life, and plush memory foam cushions.",
        },
        {
            "cat": "wearables",
            "name": "PulseTitan Ultra Smartwatch",
            "slug": "pulsetitan-ultra-smartwatch",
            "sku": "PULSE-TITAN-02",
            "price": Decimal('449.00'),
            "discount_price": Decimal('399.00'),
            "stock": 28,
            "rating_avg": Decimal('4.90'),
            "reviews_count": 86,
            "desc": "Aerospace-grade titanium chassis with dual-frequency GPS, biometric sensors, ECG, and bright always-on sapphire AMOLED display.",
        },
        {
            "cat": "home-office",
            "name": "NovaKey Pro Wireless Mechanical Keyboard",
            "slug": "novakey-pro-mechanical-keyboard",
            "sku": "NOVA-KEY-87",
            "price": Decimal('159.50'),
            "discount_price": Decimal('139.99'),
            "stock": 60,
            "rating_avg": Decimal('4.78'),
            "reviews_count": 64,
            "desc": "Hot-swappable custom lubricated switches, CNC anodized aluminum frame, RGB backlighting, and Bluetooth 5.2 multi-device switching.",
        },
        {
            "cat": "electronics",
            "name": "Zenith 4K UHD Ultra-Slim Monitor 27-inch",
            "slug": "zenith-4k-uhd-monitor-27",
            "sku": "ZEN-4K-27",
            "price": Decimal('499.99'),
            "discount_price": Decimal('449.99'),
            "stock": 20,
            "rating_avg": Decimal('4.92'),
            "reviews_count": 42,
            "desc": "Stunning IPS display covering 99% DCI-P3 color gamut with 90W USB-C power delivery, HDR400, and bezel-less design.",
        },
        {
            "cat": "audio-sound",
            "name": "SonicBuds Air True Wireless Earbuds",
            "slug": "sonicbuds-air-earbuds",
            "sku": "SND-BUD-03",
            "price": Decimal('129.99'),
            "discount_price": Decimal('99.99'),
            "stock": 80,
            "rating_avg": Decimal('4.65'),
            "reviews_count": 92,
            "desc": "Compact wireless earbuds with spatial audio, low latency gaming mode, IPX7 water resistance, and wireless charging case.",
        },
        {
            "cat": "home-office",
            "name": "ErgoGlide Precision Wireless Mouse",
            "slug": "ergoglide-precision-mouse",
            "sku": "ERGO-MS-04",
            "price": Decimal('89.99'),
            "discount_price": None,
            "stock": 35,
            "rating_avg": Decimal('4.70'),
            "reviews_count": 51,
            "desc": "Sculpted ergonomic silhouette reduces muscular strain by 25%. Features MagSpeed electromagnetic scrolling and customizable gesture controls.",
        }
    ]

    for p in products_data:
        prod, _ = Product.objects.get_or_create(
            sku=p['sku'],
            defaults={
                'category': cat_map[p['cat']],
                'name': p['name'],
                'slug': p['slug'],
                'price': p['price'],
                'discount_price': p['discount_price'],
                'stock': p['stock'],
                'rating_avg': p['rating_avg'],
                'reviews_count': p['reviews_count'],
                'description': p['desc'],
                'is_active': True,
            }
        )
    print(f"✓ Seeded {len(products_data)} products")

    # 5. Coupons
    now = timezone.now()
    Coupon.objects.get_or_create(
        code="SMARTWELCOME",
        defaults={
            'discount_percentage': Decimal('15.00'),
            'min_order_value': Decimal('50.00'),
            'valid_from': now - timedelta(days=1),
            'valid_until': now + timedelta(days=365),
            'usage_limit': 1000,
            'is_active': True,
        }
    )
    Coupon.objects.get_or_create(
        code="FLASH20",
        defaults={
            'discount_percentage': Decimal('20.00'),
            'min_order_value': Decimal('100.00'),
            'valid_from': now - timedelta(days=1),
            'valid_until': now + timedelta(days=30),
            'usage_limit': 500,
            'is_active': True,
        }
    )
    print("✓ Seeded active promo coupons (SMARTWELCOME, FLASH20)")

    print("🎉 Seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
