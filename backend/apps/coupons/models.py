from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="e.g. 15.00 for 15% off")
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=100)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def is_valid(self, subtotal=0):
        now = timezone.now()
        if not self.is_active:
            return False, "Coupon is not active."
        if now < self.valid_from or now > self.valid_until:
            return False, "Coupon has expired."
        if self.times_used >= self.usage_limit:
            return False, "Coupon usage limit reached."
        if subtotal < self.min_order_value:
            return False, f"Minimum order value of ${self.min_order_value} required."
        return True, "Coupon applied successfully."

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"
