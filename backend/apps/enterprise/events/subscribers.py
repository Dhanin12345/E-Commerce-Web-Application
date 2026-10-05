import logging
from .bus import DomainEventBus

logger = logging.getLogger(__name__)

def handle_order_created(payload, correlation_id=None):
    order_id = payload.get('order_id')
    logger.info(f"[Subscriber: InventoryReserved] Processing stock reservation for order {order_id}")
    # Trigger warehouse reservation if order items are provided
    items = payload.get('items', [])
    if items:
        try:
            from apps.enterprise.services.warehouse_service import WarehouseService
            WarehouseService.reserve_order_items(order_id, items)
        except Exception as e:
            logger.warning(f"Warehouse reservation warning: {e}")

def handle_payment_completed(payload, correlation_id=None):
    order_id = payload.get('order_id')
    amount = payload.get('amount')
    logger.info(f"[Subscriber: Fulfillment & Settlement] Order {order_id} paid ({amount}). Triggering settlement.")
    try:
        from apps.enterprise.services.settlement_service import SettlementService
        SettlementService.process_order_settlement(order_id=order_id, gross_amount=amount)
    except Exception as e:
        logger.warning(f"Settlement subscriber warning: {e}")

def handle_product_viewed(payload, correlation_id=None):
    product_id = payload.get('product_id')
    user_id = payload.get('user_id')
    logger.debug(f"[Subscriber: PersonalizationSignal] Product {product_id} viewed by user {user_id}")

def handle_inventory_reserved(payload, correlation_id=None):
    logger.info(f"[Subscriber: WarehouseAlert] Inventory reserved: {payload.get('reservation_id')}")

def register_default_subscribers():
    DomainEventBus.subscribe('OrderCreated', handle_order_created)
    DomainEventBus.subscribe('PaymentCompleted', handle_payment_completed)
    DomainEventBus.subscribe('ProductViewed', handle_product_viewed)
    DomainEventBus.subscribe('InventoryReserved', handle_inventory_reserved)
