import logging
from decimal import Decimal
from django.contrib.auth.models import User
from apps.enterprise.models import SellerSettlement

logger = logging.getLogger(__name__)

class SettlementService:
    """
    Marketplace Commission & Financial Settlement Engine (Req 18, 19)
    Gross Sale - Platform Commission - Applicable Fees = Seller Settlement
    """

    DEFAULT_COMMISSION_RATE = Decimal('10.00') # 10.00%
    PLATFORM_FIXED_FEE = Decimal('2.50')       # $2.50 transaction processing fee

    @classmethod
    def process_order_settlement(cls, order_id: int, gross_amount: float, seller_id: int | None = None) -> dict:
        gross = Decimal(str(gross_amount))
        
        # Resolve seller (fallback to superuser or first staff)
        seller = None
        if seller_id:
            seller = User.objects.filter(id=seller_id).first()
        if not seller:
            seller = User.objects.filter(is_staff=True).first() or User.objects.first()

        commission_amount = (gross * (cls.DEFAULT_COMMISSION_RATE / Decimal('100.00'))).quantize(Decimal('0.01'))
        platform_fees = cls.PLATFORM_FIXED_FEE
        net_settlement = max(Decimal('0.00'), gross - commission_amount - platform_fees)

        settlement = SellerSettlement.objects.create(
            seller=seller,
            order_id=order_id,
            gross_sale=gross,
            commission_rate=cls.DEFAULT_COMMISSION_RATE,
            commission_amount=commission_amount,
            platform_fees=platform_fees,
            net_settlement=net_settlement,
            status='PENDING',
            notes=f"Order #{order_id} automated settlement calculation."
        )

        logger.info(f"Recorded settlement {settlement.settlement_id} for seller {seller.username}: Net {net_settlement}")

        return {
            "settlement_id": str(settlement.settlement_id),
            "order_id": order_id,
            "seller": seller.username,
            "gross_sale": float(gross),
            "commission_rate": float(cls.DEFAULT_COMMISSION_RATE),
            "commission_amount": float(commission_amount),
            "platform_fees": float(platform_fees),
            "net_settlement": float(net_settlement),
            "status": settlement.status
        }
