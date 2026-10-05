import hashlib
import json
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class IdempotencyService:
    @classmethod
    def check_key(cls, key: str, path: str, payload: dict) -> Tuple[bool, Optional[int], Optional[dict]]:
        """
        Returns (exists, response_status, response_data)
        """
        if not key:
            return False, None, None

        from apps.enterprise.models import IdempotencyRecord
        payload_str = json.dumps(payload, sort_keys=True, default=str)
        request_hash = hashlib.sha256(payload_str.encode('utf-8')).hexdigest()

        try:
            record = IdempotencyRecord.objects.get(idempotency_key=key)
            # Replay previous result
            logger.info(f"Idempotency hit for key [{key}]. Replaying previous response.")
            return True, record.response_status, record.response_data
        except IdempotencyRecord.DoesNotExist:
            return False, None, None

    @classmethod
    def store_result(cls, key: str, path: str, payload: dict, status_code: int, response_data: dict):
        if not key:
            return

        from apps.enterprise.models import IdempotencyRecord
        payload_str = json.dumps(payload, sort_keys=True, default=str)
        request_hash = hashlib.sha256(payload_str.encode('utf-8')).hexdigest()

        try:
            IdempotencyRecord.objects.update_or_create(
                idempotency_key=key,
                defaults={
                    "request_path": path,
                    "request_hash": request_hash,
                    "response_status": status_code,
                    "response_data": response_data
                }
            )
        except Exception as e:
            logger.warning(f"Could not store idempotency key {key}: {e}")
