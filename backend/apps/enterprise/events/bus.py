import logging
import uuid
from typing import Callable, Dict, List

logger = logging.getLogger(__name__)

class DomainEventBus:
    _listeners: Dict[str, List[Callable]] = {}

    @classmethod
    def subscribe(cls, event_name: str, handler: Callable):
        if event_name not in cls._listeners:
            cls._listeners[event_name] = []
        cls._listeners[event_name].append(handler)

    @classmethod
    def publish(cls, event_name: str, payload: dict, correlation_id: str | None = None) -> dict:
        event_id = str(uuid.uuid4())
        correlation_id = correlation_id or str(uuid.uuid4())
        
        executed_subscribers = []
        errors = []

        handlers = cls._listeners.get(event_name, [])
        for handler in handlers:
            handler_name = getattr(handler, '__name__', str(handler))
            try:
                handler(payload, correlation_id=correlation_id)
                executed_subscribers.append(handler_name)
            except Exception as e:
                logger.error(f"Error in subscriber {handler_name} for event {event_name}: {e}")
                errors.append(f"{handler_name}: {str(e)}")

        # Persist event log to database if available
        try:
            from apps.enterprise.models import DomainEventLog
            DomainEventLog.objects.create(
                event_id=event_id,
                event_name=event_name,
                correlation_id=correlation_id,
                payload=payload,
                status='FAILED' if errors else 'PROCESSED',
                subscribers_notified=executed_subscribers
            )
        except Exception as db_err:
            logger.warning(f"Could not log domain event to DB: {db_err}")

        return {
            "event_id": event_id,
            "event_name": event_name,
            "correlation_id": correlation_id,
            "subscribers_notified": executed_subscribers,
            "errors": errors,
            "status": "FAILED" if errors else "PROCESSED"
        }

    @classmethod
    def clear_all(cls):
        cls._listeners = {}

    @classmethod
    def get_registered_events(cls):
        return {evt: [h.__name__ for h in handlers] for evt, handlers in cls._listeners.items()}
