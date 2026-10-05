import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AIGovernanceEngine:
    """
    AI Model Governance, Validation & Safety Enforcement (Req 32, 33)
    Guarantees AI cannot perform irreversible administrative or financial actions alone.
    """

    CRITICAL_ACTIONS = {
        "CHARGE_CARD",
        "DIRECT_REFUND_EXECUTION",
        "DELETE_USER_DATA",
        "CHANGE_ROLE_PERMISSIONS",
        "PURGE_DATABASE_RECORDS"
    }

    @classmethod
    def validate_action(cls, proposed_action: str, context: dict, is_human_confirmed: bool = False) -> Dict[str, Any]:
        """
        Safety Gate: Blocks autonomous AI execution of critical commerce operations.
        """
        if proposed_action in cls.CRITICAL_ACTIONS and not is_human_confirmed:
            logger.warning(f"AI Safety Blocked: Attempted action {proposed_action} requires explicit human confirmation.")
            return {
                "action": proposed_action,
                "allowed": False,
                "reason": "AI alone is not authorized to finalize payments or delete accounts without user confirmation.",
                "requires_human_approval": True
            }

        return {
            "action": proposed_action,
            "allowed": True,
            "reason": "Action validated within safe AI operating parameters.",
            "requires_human_approval": False
        }

    @classmethod
    def audit_model(cls, model_id: str) -> Dict[str, Any]:
        from apps.enterprise.models import AIModelRegistry
        try:
            model = AIModelRegistry.objects.get(model_id=model_id)
            return {
                "model_id": model.model_id,
                "name": model.name,
                "version": model.version,
                "status": model.status,
                "safety_approved": model.safety_approved,
                "metrics": model.evaluation_metrics
            }
        except AIModelRegistry.DoesNotExist:
            return {"error": f"Model {model_id} not found in enterprise registry."}
