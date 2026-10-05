import logging
from decimal import Decimal
from apps.products.models import Product
from apps.enterprise.models import PriceRule

logger = logging.getLogger(__name__)

class PricingService:
    """
    Deterministic & Auditable Real-Time Pricing Engine (Req 14)
    Calculates dynamic display price according to inventory state and campaign rules.
    """

    @classmethod
    def calculate_display_price(cls, product: Product, quantity: int = 1, user=None) -> dict:
        base_price = Decimal(str(product.price))
        current_price = base_price
        applied_rules = []

        rules = PriceRule.objects.filter(product=product, is_active=True)
        for r in rules:
            if r.rule_type == 'INVENTORY_CLEARANCE' and product.stock > r.min_inventory_trigger:
                discounted = (current_price * r.multiplier) - r.fixed_adjustment
                current_price = max(Decimal('1.00'), discounted)
                applied_rules.append(f"Clearance Discount ({int((1 - r.multiplier)*100)}% off)")
            elif r.rule_type == 'SURGE_PRICING' and product.stock < r.min_inventory_trigger:
                surged = (current_price * r.multiplier)
                current_price = surged
                applied_rules.append(f"High-Demand Adjustment (+{int((r.multiplier - 1)*100)}%)")
            elif r.rule_type == 'VOLUME_DISCOUNT' and quantity >= 3:
                volume_price = current_price * Decimal('0.90') # 10% bulk discount
                current_price = volume_price
                applied_rules.append("Volume Tier Discount (10% off for 3+ units)")

        final_unit_price = current_price.quantize(Decimal('0.01'))
        total_price = (final_unit_price * quantity).quantize(Decimal('0.01'))

        return {
            "product_id": product.id,
            "product_name": product.name,
            "base_unit_price": float(base_price),
            "final_unit_price": float(final_unit_price),
            "quantity": quantity,
            "total_price": float(total_price),
            "applied_rules": applied_rules,
            "is_discounted": final_unit_price < base_price,
            "audit_hash": f"CALC-{product.id}-{quantity}-{int(final_unit_price * 100)}"
        }
