from decimal import Decimal
from django.utils import timezone
from apps.products.models import Product
from apps.enterprise.models import PriceRule, PriceCalculationAudit

class SmartPricingEngine:
    """
    L14 Smart Pricing Engine:
    Deterministic, auditable, explainable, and versioned pricing calculation.
    """

    VERSION = "2.4.0"

    @classmethod
    def calculate_price_with_audit(cls, product_id, quantity=1, customer_segment="STANDARD", region="IN-SOUTH"):
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return {"error": "Product not found"}

        base_price = Decimal(str(product.price))
        steps = []
        multiplier = Decimal("1.0000")
        fixed_adjustments = Decimal("0.00")

        steps.append({
            "stage": "BASE_PRICE",
            "amount": float(base_price),
            "explanation": f"Catalog baseline MSRP for {product.name}"
        })

        # 1. Check database-driven PriceRule
        active_rule = PriceRule.objects.filter(product=product, is_active=True).first()
        rule_name = "CATALOG_DEFAULT"
        if active_rule:
            rule_name = active_rule.rule_name
            multiplier *= active_rule.multiplier
            fixed_adjustments += active_rule.fixed_adjustment
            steps.append({
                "stage": f"RULE_{active_rule.rule_type}",
                "multiplier": float(active_rule.multiplier),
                "adjustment": float(active_rule.fixed_adjustment),
                "explanation": f"Rule '{active_rule.rule_name}' applied"
            })

        # 2. Volume Discount
        if quantity >= 10:
            vol_discount = Decimal("0.90") # 10% off
            multiplier *= vol_discount
            steps.append({
                "stage": "VOLUME_TIER_B2B",
                "discount_multiplier": 0.90,
                "explanation": f"Volume tier threshold met (Qty: {quantity} >= 10)"
            })
        elif quantity >= 5:
            vol_discount = Decimal("0.95") # 5% off
            multiplier *= vol_discount
            steps.append({
                "stage": "VOLUME_TIER_PRO",
                "discount_multiplier": 0.95,
                "explanation": f"Volume tier threshold met (Qty: {quantity} >= 5)"
            })

        # 3. Customer Segment Rule
        if customer_segment == "VIP":
            vip_discount = Decimal("0.95")
            multiplier *= vip_discount
            steps.append({
                "stage": "VIP_CUSTOMER_PERK",
                "discount_multiplier": 0.95,
                "explanation": "VIP loyalty segment 5% tier benefit applied"
            })

        # 4. Compute Final Price
        computed_unit_price = round((base_price * multiplier) + fixed_adjustments, 2)
        total_price = round(computed_unit_price * quantity, 2)

        signals_used = {
            "quantity": quantity,
            "customer_segment": customer_segment,
            "region": region,
            "inventory_on_hand": product.stock,
            "calculation_steps": steps
        }

        # Persist immutable audit log
        audit = PriceCalculationAudit.objects.create(
            product=product,
            rule_applied=rule_name,
            rule_version=cls.VERSION,
            base_price=base_price,
            computed_price=computed_unit_price,
            signals_used=signals_used,
            source="Autonomous Smart Pricing Engine L14"
        )

        return {
            "audit_id": str(audit.audit_id),
            "product_id": product.id,
            "product_name": product.name,
            "base_price": float(base_price),
            "computed_unit_price": float(computed_unit_price),
            "quantity": quantity,
            "total_price": float(total_price),
            "effective_discount_pct": round(float((1 - (computed_unit_price / base_price)) * 100), 2) if base_price > 0 else 0.0,
            "rule_version": cls.VERSION,
            "rule_applied": rule_name,
            "breakdown_steps": steps,
            "audit_ref": f"PRC-AUDIT-{audit.audit_id}",
            "calculated_at": audit.created_at.isoformat()
        }

    @classmethod
    def list_audits(cls, limit=15):
        audits = PriceCalculationAudit.objects.order_by('-created_at')[:limit]
        return [
            {
                "audit_id": str(a.audit_id),
                "product_name": a.product.name,
                "rule_applied": a.rule_applied,
                "rule_version": a.rule_version,
                "base_price": float(a.base_price),
                "computed_price": float(a.computed_price),
                "signals": a.signals_used,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            for a in audits
        ]
