from django.db import models
from apps.products.models import Product

class InventoryLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    change_amount = models.IntegerField(help_text="Positive for restocking, negative for order deduction")
    reason = models.CharField(max_length=100) # RESTOCK, ORDER_DEDUCTION, RETURN, ADJUSTMENT
    resulting_stock = models.PositiveIntegerField()
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f"{self.product.name}: {self.change_amount:+d} ({self.reason})"


class PricingRuleType(models.TextChoices):
    HIGH_STOCK_DISCOUNT = 'HIGH_STOCK_DISCOUNT', 'High Stock Clearance Discount'
    LOW_STOCK_SURCHARGE = 'LOW_STOCK_SURCHARGE', 'Scarcity / Low Stock Protection'
    PROMOTIONAL_FLASH = 'PROMOTIONAL_FLASH', 'Promotional Campaign'
    DEMAND_SURGE = 'DEMAND_SURGE', 'High Velocity Surge Pricing'


class DynamicPricingRule(models.Model):
    name = models.CharField(max_length=120)
    rule_type = models.CharField(max_length=40, choices=PricingRuleType.choices, default=PricingRuleType.HIGH_STOCK_DISCOUNT)
    min_stock_threshold = models.PositiveIntegerField(default=0)
    max_stock_threshold = models.PositiveIntegerField(default=100)
    price_adjustment_pct = models.DecimalField(max_digits=5, decimal_places=2, help_text="Negative for discount, positive for markup")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.rule_type}): {self.price_adjustment_pct}%"

