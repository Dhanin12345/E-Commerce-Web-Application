from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from apps.products.models import Product
from apps.enterprise.models import (
    Warehouse, WarehouseInventory, AIModelRegistry, FeatureFlag,
    FeatureExperiment, PriceRule, Wallet, WalletTransaction
)

class Command(BaseCommand):
    help = 'Seeds initial enterprise warehouses, AI models, feature flags, and wallets'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Enterprise Architecture Foundation...")

        # 1. Multi-Warehouse Hubs
        wh1, _ = Warehouse.objects.get_or_create(
            code="WH-BLR-01",
            defaults={
                "name": "Bengaluru Central Mega-Hub",
                "address": "Electronic City Phase 1, Hosur Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "postal_code": "560100",
                "latitude": Decimal("12.8452"),
                "longitude": Decimal("77.6602"),
                "capacity_units": 150000,
                "is_active": True
            }
        )

        wh2, _ = Warehouse.objects.get_or_create(
            code="WH-BOM-02",
            defaults={
                "name": "Mumbai Western Express Depot",
                "address": "Bhiwandi Logistics Park, NH 160",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postal_code": "421302",
                "latitude": Decimal("19.2969"),
                "longitude": Decimal("73.0631"),
                "capacity_units": 120000,
                "is_active": True
            }
        )

        wh3, _ = Warehouse.objects.get_or_create(
            code="WH-DEL-03",
            defaults={
                "name": "Delhi NCR Northern Fulfillment Center",
                "address": "Tauru Road, Bilaspur Industrial Area",
                "city": "Gurugram",
                "state": "Haryana",
                "postal_code": "122413",
                "latitude": Decimal("28.3248"),
                "longitude": Decimal("76.8837"),
                "capacity_units": 180000,
                "is_active": True
            }
        )

        # Distribute stocks across warehouses for all catalog products
        for p in Product.objects.all():
            WarehouseInventory.objects.get_or_create(
                warehouse=wh1, product=p,
                defaults={"quantity_on_hand": 85, "reserved_quantity": 0, "reorder_threshold": 15}
            )
            WarehouseInventory.objects.get_or_create(
                warehouse=wh2, product=p,
                defaults={"quantity_on_hand": 60, "reserved_quantity": 0, "reorder_threshold": 15}
            )
            WarehouseInventory.objects.get_or_create(
                warehouse=wh3, product=p,
                defaults={"quantity_on_hand": 95, "reserved_quantity": 0, "reorder_threshold": 20}
            )

        # 2. AI Model Governance Registry
        AIModelRegistry.objects.get_or_create(
            model_id="sc-recommend-v3.2",
            defaults={
                "name": "Hybrid Collaborative Filter & Ranking",
                "version": "3.2.0",
                "model_type": "RECOMMENDATION",
                "status": "ACTIVE",
                "owner": "SmartCart Recommendation Team",
                "evaluation_metrics": {"ndcg@10": 0.89, "latency_p99_ms": 18, "f1_score": 0.92},
                "safety_approved": True
            }
        )
        AIModelRegistry.objects.get_or_create(
            model_id="sc-rag-gemini-v2.4",
            defaults={
                "name": "Grounded Product Assistant & Policy RAG",
                "version": "2.4.1",
                "model_type": "RAG",
                "status": "ACTIVE",
                "owner": "Enterprise GenAI Engineering",
                "evaluation_metrics": {"hallucination_rate": 0.008, "citation_accuracy": 0.98, "latency_ms": 110},
                "safety_approved": True
            }
        )
        AIModelRegistry.objects.get_or_create(
            model_id="sc-fraud-forest-v1.8",
            defaults={
                "name": "Multi-Signal Fraud Velocity Scorer",
                "version": "1.8.4",
                "model_type": "FRAUD_DETECTION",
                "status": "ACTIVE",
                "owner": "Risk & Compliance Operations",
                "evaluation_metrics": {"auc_roc": 0.975, "false_positive_pct": 1.2, "latency_ms": 9},
                "safety_approved": True
            }
        )

        # 3. Enterprise Feature Flags
        FeatureFlag.objects.get_or_create(
            key="smart_checkout_v2",
            defaults={
                "name": "Distributed 1-Click Smart Checkout",
                "description": "Streamlined checkout using pre-reserved inventory and wallet balance.",
                "is_enabled": True,
                "rollout_percentage": 100
            }
        )
        FeatureFlag.objects.get_or_create(
            key="vector_semantic_search",
            defaults={
                "name": "Hybrid Semantic Vector Search",
                "description": "Combines cosine similarity vector embedding with BM25 keyword matching.",
                "is_enabled": True,
                "rollout_percentage": 100
            }
        )
        FeatureFlag.objects.get_or_create(
            key="multiwarehouse_routing",
            defaults={
                "name": "Proximity-Optimized Multi-Warehouse Routing",
                "description": "Calculates split shipments and shortest delivery SLAs from regional depots.",
                "is_enabled": True,
                "rollout_percentage": 100
            }
        )

        # 4. Feature Experiment (A/B Test)
        FeatureExperiment.objects.get_or_create(
            experiment_key="exp_pdp_sticky_cart",
            defaults={
                "name": "Sticky Add-to-Cart Bar on PDP",
                "hypothesis": "Floating bottom CTA increases mobile add-to-cart conversion by 14%",
                "variants": ["control", "sticky_floating_cta"],
                "impressions": {"control": 1820, "sticky_floating_cta": 1850},
                "conversions": {"control": 142, "sticky_floating_cta": 189},
                "status": "RUNNING"
            }
        )

        # 5. User Wallets
        for u in User.objects.all():
            w, _ = Wallet.objects.get_or_create(user=u, defaults={"balance": Decimal('1250.00'), "currency": "INR"})
            if not w.transactions.exists():
                WalletTransaction.objects.create(
                    wallet=w,
                    transaction_type="CREDIT",
                    amount=Decimal("1250.00"),
                    balance_after=Decimal("1250.00"),
                    reference_id="INIT-STORE-CREDIT",
                    description="Enterprise Launch Promotional Credit"
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded SmartCart X Enterprise Foundation!"))
