import os
import django
from django.utils import timezone
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from apps.products.models import Product
from apps.loyalty.models import LoyaltyAccount, LoyaltyTransaction
from apps.marketplace.models import SellerProfile, SellerSettlement
from apps.support.models import SupportTicket, TicketMessage
from apps.inventory.models import DynamicPricingRule, PricingRuleType
from apps.users.models import AuditLog
from apps.alerts.models import PriceAlert

def seed():
    print("🌱 Seeding SmartCart Future Features...")

    customer = User.objects.filter(username='customer').first()
    admin = User.objects.filter(username='admin').first()

    if not customer:
        print("Customer user not found, skipping user-specific seeds.")
        return

    # 1. Loyalty Points for customer
    loyalty, created = LoyaltyAccount.objects.get_or_create(
        user=customer,
        defaults={
            'points_balance': 350,
            'lifetime_earned': 650,
            'tier': 'SILVER'
        }
    )
    if created:
        LoyaltyTransaction.objects.create(
            account=loyalty,
            points=100,
            transaction_type='SIGNUP',
            description='Welcome to SmartCart Rewards!'
        )
        LoyaltyTransaction.objects.create(
            account=loyalty,
            points=250,
            transaction_type='PURCHASE',
            description='Reward for Order ORD-489A1201'
        )
        print("  ✓ Seeded Customer Loyalty Account with 350 points (Silver VIP tier).")

    # 2. Marketplace Seller Profile
    seller_user, _ = User.objects.get_or_create(
        username='techzone_seller',
        defaults={'email': 'contact@techzone.io', 'first_name': 'TechZone', 'last_name': 'Official'}
    )
    seller_profile, created = SellerProfile.objects.get_or_create(
        user=seller_user,
        defaults={
            'store_name': 'TechZone Official',
            'business_email': 'sales@techzone.io',
            'phone': '+1 (555) 392-8819',
            'description': 'Premier certified electronics & mobile audio accessories.',
            'commission_pct': 8.50,
            'is_approved': True,
            'rating': 4.90,
            'total_sales': 14850.00
        }
    )
    if created:
        print("  ✓ Seeded Marketplace Seller 'TechZone Official' with 8.5% platform commission.")

    # 3. Dynamic Pricing Rules
    if not DynamicPricingRule.objects.exists():
        DynamicPricingRule.objects.create(
            name="Overstock Clearance Campaign",
            rule_type=PricingRuleType.HIGH_STOCK_DISCOUNT,
            min_stock_threshold=40,
            max_stock_threshold=999,
            price_adjustment_pct=-15.00,
            is_active=True
        )
        DynamicPricingRule.objects.create(
            name="Scarcity Surge Protection",
            rule_type=PricingRuleType.LOW_STOCK_SURCHARGE,
            min_stock_threshold=1,
            max_stock_threshold=5,
            price_adjustment_pct=5.00,
            is_active=False
        )
        print("  ✓ Seeded Dynamic Pricing Rules.")

    # 4. Support Tickets
    if not SupportTicket.objects.exists():
        ticket = SupportTicket.objects.create(
            user=customer,
            subject="Inquiry regarding expedited courier shipping",
            category="ORDER",
            priority="MEDIUM",
            status="OPEN"
        )
        TicketMessage.objects.create(
            ticket=ticket,
            sender=customer,
            message="Hi! I wanted to check if overnight shipping is available to Seattle for the Sony Headphones?",
            is_admin_reply=False
        )
        print("  ✓ Seeded sample customer support ticket.")

    # 5. Security Audit Logs
    if not AuditLog.objects.exists():
        AuditLog.objects.create(
            user=admin,
            action="ADMIN_LOGIN",
            resource="/api/auth/login/",
            ip_address="127.0.0.1",
            result="SUCCESS",
            details="Admin session authenticated via JWT."
        )
        AuditLog.objects.create(
            user=customer,
            action="CUSTOMER_LOGIN",
            resource="/api/auth/login/",
            ip_address="127.0.0.1",
            result="SUCCESS",
            details="Customer logged in successfully."
        )
        print("  ✓ Seeded security audit logs.")

    # 6. Sample Price Alert
    sample_prod = Product.objects.first()
    if sample_prod and not PriceAlert.objects.filter(user=customer).exists():
        PriceAlert.objects.create(
            user=customer,
            product=sample_prod,
            target_price=round(float(sample_prod.current_price) * 0.9, 2),
            is_active=True
        )
        print(f"  ✓ Seeded price alert for {sample_prod.name}.")

    print("🎉 Future features database seeding completed successfully!")

if __name__ == '__main__':
    seed()
