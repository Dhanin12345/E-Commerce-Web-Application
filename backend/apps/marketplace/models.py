from django.db import models
from django.contrib.auth.models import User

class SellerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    store_name = models.CharField(max_length=150, unique=True)
    business_email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    commission_pct = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="Platform commission percentage")
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.store_name} ({'Approved' if self.is_approved else 'Pending Approval'})"

class SellerSettlement(models.Model):
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='settlements')
    order_number = models.CharField(max_length=32)
    product_name = models.CharField(max_length=255)
    sale_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='PENDING') # PENDING, SETTLED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.seller.store_name} - {self.product_name} (${self.net_earnings} net)"
