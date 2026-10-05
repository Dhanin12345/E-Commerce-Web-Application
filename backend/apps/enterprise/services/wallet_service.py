import logging
from decimal import Decimal
from django.db import transaction
from django.contrib.auth.models import User
from apps.enterprise.models import Wallet, WalletTransaction

logger = logging.getLogger(__name__)

class WalletService:
    """
    Digital Wallet & Store Credit Double-Entry Ledger (Req 20)
    Never overwrites wallet balance directly without recording corresponding transaction.
    """

    @classmethod
    def get_or_create_wallet(cls, user: User) -> Wallet:
        wallet, created = Wallet.objects.get_or_create(
            user=user,
            defaults={"balance": Decimal('500.00'), "currency": "INR"} # ₹500 welcome credit
        )
        return wallet

    @classmethod
    def process_transaction(cls, user: User, transaction_type: str, amount: float, description: str, reference_id: str = "") -> dict:
        amount_dec = Decimal(str(amount)).quantize(Decimal('0.01'))
        if amount_dec <= Decimal('0.00'):
            raise ValueError("Transaction amount must be strictly greater than 0.")

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(user=user)

            if wallet.is_frozen:
                raise ValueError("Wallet is currently frozen. Contact customer support.")

            if transaction_type == 'DEBIT':
                if wallet.balance < amount_dec:
                    raise ValueError(f"Insufficient wallet balance. Available: {wallet.currency} {wallet.balance}")
                new_balance = wallet.balance - amount_dec
            elif transaction_type in ('CREDIT', 'REFUND', 'ADJUSTMENT'):
                new_balance = wallet.balance + amount_dec
            else:
                raise ValueError(f"Invalid transaction type: {transaction_type}")

            wallet.balance = new_balance
            wallet.save()

            txn = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type=transaction_type,
                amount=amount_dec,
                balance_after=new_balance,
                reference_id=reference_id,
                description=description
            )

        logger.info(f"Wallet {transaction_type} executed for {user.username}: {amount_dec} (New Bal: {new_balance})")

        return {
            "transaction_id": txn.id,
            "type": txn.transaction_type,
            "amount": float(txn.amount),
            "balance_after": float(txn.balance_after),
            "reference_id": txn.reference_id,
            "description": txn.description,
            "created_at": txn.created_at.isoformat()
        }
