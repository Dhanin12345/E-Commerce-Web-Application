import uuid
from decimal import Decimal
from django.db import transaction
from .models import Payment, PaymentStatus
from apps.orders.models import Order, OrderStatus

class PaymentService:
    @staticmethod
    @transaction.atomic
    def process_payment(order: Order, payment_method: str, card_token: str | None = None) -> Payment:
        # Simulate payment gateway verification
        is_successful = True  # Real gateways (Stripe/PayPal) call webhooks/SDK here
        
        transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        status = PaymentStatus.COMPLETED if is_successful else PaymentStatus.FAILED

        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                'transaction_id': transaction_id,
                'payment_method': payment_method,
                'amount': order.total_amount,
                'status': status
            }
        )

        if is_successful:
            order.status = OrderStatus.PAID
            order.save(update_fields=['status'])

        return payment
