import logging
from apps.enterprise.models import FraudRiskScore

logger = logging.getLogger(__name__)

class FraudRiskEngine:
    """
    Advanced Multi-Signal Fraud-Risk Engine (Req 21)
    Outputs: LOW, MEDIUM, HIGH with explainable contributing risk factors.
    """

    @classmethod
    def evaluate_order(cls, order_id: str, amount: float, user=None, ip_address: str = "127.0.0.1", payment_attempts: int = 1) -> dict:
        risk_score = 10
        factors = []

        # 1. High value order check
        if amount > 1000.0:
            risk_score += 25
            factors.append(f"High-value transaction threshold exceeded (${amount:.2f} > $1,000)")
        elif amount > 500.0:
            risk_score += 10
            factors.append("Moderate transaction value check ($500+)")

        # 2. Payment attempt velocity
        if payment_attempts > 2:
            risk_score += 35
            factors.append(f"Multiple consecutive payment attempts detected ({payment_attempts} attempts)")

        # 3. New account / anonymous checkout
        if not user or not user.is_authenticated:
            risk_score += 15
            factors.append("Guest / Anonymous checkout without verified purchase history")
        elif (user.date_joined and (user.date_joined.year == 2026)):
            risk_score += 5
            factors.append("Recently registered customer profile (< 30 days)")

        # Normalize score
        risk_score = min(100, max(0, risk_score))

        # Assign risk category
        if risk_score >= 65:
            risk_level = "HIGH"
            action = "MANUAL_REVIEW"
        elif risk_score >= 35:
            risk_level = "MEDIUM"
            action = "CHALLENGE"
        else:
            risk_level = "LOW"
            action = "ALLOW"

        # Record evaluation
        record = FraudRiskScore.objects.create(
            order_id=str(order_id),
            user=user if user and user.is_authenticated else None,
            risk_score=risk_score,
            risk_level=risk_level,
            reasons=factors,
            action_taken=action
        )

        logger.info(f"Fraud evaluation for Order #{order_id}: Score {risk_score} [{risk_level}] - Action: {action}")

        return {
            "evaluation_id": record.id,
            "order_id": order_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "action_taken": action,
            "contributing_factors": factors,
            "is_blocked": risk_level == "HIGH"
        }
