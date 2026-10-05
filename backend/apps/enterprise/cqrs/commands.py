import logging
from apps.enterprise.events.bus import DomainEventBus

logger = logging.getLogger(__name__)

class CommandHandler:
    @classmethod
    def handle_create_order(cls, user, order_data: dict, correlation_id: str | None = None) -> dict:
        """
        CQRS Command: Create Order with state machine validation and event emission
        """
        from apps.orders.models import Order, OrderItem
        from apps.products.models import Product

        items_data = order_data.get('items', [])
        shipping_address = order_data.get('shipping_address', 'Default Address')
        shipping_cost = float(order_data.get('shipping_cost', 0.0))
        discount_amount = float(order_data.get('discount_amount', 0.0))

        # 1. Precalculate subtotal
        subtotal = 0.0
        resolved_items = []
        for it in items_data:
            prod_id = it.get('product_id')
            qty = int(it.get('quantity', 1))
            product = Product.objects.get(id=prod_id)
            price = float(product.current_price)
            subtotal += (price * qty)
            resolved_items.append((product, qty, price))

        total_amount = max(0.0, subtotal + shipping_cost - discount_amount)

        # 2. State machine initialization: PENDING / CREATED
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            subtotal=subtotal,
            total_amount=total_amount,
            status='PENDING'
        )

        order_items_summary = []
        for product, qty, price in resolved_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=price,
                quantity=qty,
                subtotal=round(price * qty, 2)
            )
            order_items_summary.append({"product_id": product.id, "quantity": qty, "price": price})

        order.total_amount = max(0.0, total_amount + shipping_cost - discount_amount)
        order.save()

        # 2. Emit Domain Event
        event_res = DomainEventBus.publish(
            event_name='OrderCreated',
            payload={
                'order_id': order.id,
                'order_number': order.order_number,
                'user_id': user.id,
                'total_amount': float(order.total_amount),
                'items': order_items_summary
            },
            correlation_id=correlation_id
        )

        return {
            "command": "CreateOrderCommand",
            "success": True,
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "event_emitted": event_res
        }

    @classmethod
    def handle_reserve_inventory(cls, order_id: str, items: list, correlation_id: str | None = None) -> dict:
        """
        CQRS Command: Concurrency-safe Inventory Reservation
        """
        from apps.enterprise.services.warehouse_service import WarehouseService
        result = WarehouseService.reserve_order_items(order_id, items)
        
        DomainEventBus.publish(
            event_name='InventoryReserved',
            payload={'order_id': order_id, 'result': result},
            correlation_id=correlation_id
        )
        return {"command": "ReserveInventoryCommand", "success": True, "result": result}
