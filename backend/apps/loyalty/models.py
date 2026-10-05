from django.db import models
from django.contrib.auth.models import User

class LoyaltyTier(models.TextChoices):
    BRONZE = 'BRONZE', 'Bronze Member'
    SILVER = 'SILVER', 'Silver VIP'
    GOLD = 'GOLD', 'Gold Elite'
    PLATINUM = 'PLATINUM', 'Platinum Club'

class LoyaltyAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='loyalty_account')
    points_balance = models.PositiveIntegerField(default=100) # 100 free welcome points
    lifetime_earned = models.PositiveIntegerField(default=100)
    tier = models.CharField(max_length=20, choices=LoyaltyTier.choices, default=LoyaltyTier.BRONZE)
    updated_at = models.DateTimeField(auto_now=True)

    def add_points(self, amount, reason="Purchase reward"):
        self.points_balance += amount
        self.lifetime_earned += amount
        # Update tier based on lifetime points
        if self.lifetime_earned >= 2000:
            self.tier = LoyaltyTier.PLATINUM
        elif self.lifetime_earned >= 1000:
            self.tier = LoyaltyTier.GOLD
        elif self.lifetime_earned >= 500:
            self.tier = LoyaltyTier.SILVER
        self.save()

        LoyaltyTransaction.objects.create(
            account=self,
            points=amount,
            transaction_type='EARNED',
            description=reason
        )

    def redeem_points(self, amount, description="Discount voucher redemption"):
        if amount > self.points_balance:
            raise ValueError("Insufficient points balance.")
        self.points_balance -= amount
        self.save()

        LoyaltyTransaction.objects.create(
            account=self,
            points=-amount,
            transaction_type='REDEEMED',
            description=description
        )

    def __str__(self):
        return f"{self.user.username} - {self.points_balance} pts ({self.tier})"

class LoyaltyTransaction(models.Model):
    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name='transactions')
    points = models.IntegerField(help_text="Positive for earned, negative for redeemed")
    transaction_type = models.CharField(max_length=20, default='EARNED') # EARNED, REDEEMED, BONUS
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.points:+d} pts ({self.description})"
