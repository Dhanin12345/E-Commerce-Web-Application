import logging
from collections import deque
from datetime import datetime

logger = logging.getLogger(__name__)

# Event Types
EVENT_USER_REGISTERED = 'USER_REGISTERED'
EVENT_PRODUCT_VIEWED = 'PRODUCT_VIEWED'
EVENT_CART_UPDATED = 'CART_UPDATED'
EVENT_ORDER_CREATED = 'ORDER_CREATED'
EVENT_PAYMENT_COMPLETED = 'PAYMENT_COMPLETED'
EVENT_ORDER_SHIPPED = 'ORDER_SHIPPED'
EVENT_ORDER_DELIVERED = 'ORDER_DELIVERED'
EVENT_PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK'
EVENT_STOCK_CHANGED = 'STOCK_CHANGED'
EVENT_RETURN_REQUESTED = 'RETURN_REQUESTED'

# Global in-memory broadcast event ring buffer for real-time collaborative admin (Requirement 28)
ADMIN_EVENT_STREAM = deque(maxlen=100)


class EventDispatcher:
    """Internal publish-subscribe event bus (Requirement 27)."""
    _listeners = {}

    @classmethod
    def subscribe(cls, event_type, handler):
        if event_type not in cls._listeners:
            cls._listeners[event_type] = []
        cls._listeners[event_type].append(handler)

    @classmethod
    def emit(cls, event_type, payload=None, user=None):
        payload = payload or {}
        event_obj = {
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'user_id': user.id if user and hasattr(user, 'id') else None,
            'payload': payload
        }

        # Add to Admin real-time collaborative stream
        ADMIN_EVENT_STREAM.append(event_obj)
        logger.info(f"[EVENT-BUS] Emitted {event_type}: {payload}")

        handlers = cls._listeners.get(event_type, [])
        for handler in handlers:
            try:
                handler(event_obj)
            except Exception as e:
                logger.error(f"[EVENT-BUS] Handler {handler.__name__} failed on {event_type}: {e}")

        return event_obj


# Default Handlers
def handle_stock_change(event):
    """Notify waitlist if product is restocked."""
    if event['event_type'] == EVENT_PRODUCT_BACK_IN_STOCK:
        from apps.nextgen.models import WaitlistEntry
        product_id = event['payload'].get('product_id')
        if product_id:
            entries = WaitlistEntry.objects.filter(product_id=product_id, notified=False)
            count = entries.update(notified=True)
            logger.info(f"[STOCK_RESTOCK] Notified {count} waitlisted customers for product #{product_id}")


EventDispatcher.subscribe(EVENT_PRODUCT_BACK_IN_STOCK, handle_stock_change)
