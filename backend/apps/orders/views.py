from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Order, OrderStatus
from .serializers import OrderSerializer, CreateOrderRequestSerializer
from .services import OrderService

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'order_number'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

class CreateOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CreateOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = OrderService.create_order_from_cart(
                user=request.user,
                shipping_address=data['shipping_address'],
                discount_amount=data.get('discount_amount', 0),
                shipping_cost=data.get('shipping_cost', 0)
            )
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderTimelineView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        # Generate tracking timeline stages based on order status
        stages = [
            {"key": OrderStatus.PENDING, "label": "Order Placed", "completed": True, "date": order.created_at},
            {"key": OrderStatus.PAID, "label": "Payment Confirmed", "completed": order.status in [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]},
            {"key": OrderStatus.PROCESSING, "label": "Processing in Warehouse", "completed": order.status in [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]},
            {"key": OrderStatus.SHIPPED, "label": "Shipped with Tracking", "completed": order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED], "tracking_number": order.tracking_number},
            {"key": OrderStatus.DELIVERED, "label": "Delivered to Customer", "completed": order.status == OrderStatus.DELIVERED},
        ]
        return Response({
            "order_number": order.order_number,
            "status": order.status,
            "timeline": stages
        }, status=status.HTTP_200_OK)


class DeliveryTrackingView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        if not request.user.is_staff and order.user != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        from .models import DeliveryShipment, ShipmentStatus
        shipment, _ = DeliveryShipment.objects.get_or_create(
            order=order,
            defaults={
                'tracking_code': order.tracking_number or f"TRK-{order.order_number}",
                'courier_name': 'SmartCart Express Delivery',
                'current_status': ShipmentStatus.IN_TRANSIT if order.status == OrderStatus.SHIPPED else ShipmentStatus.PENDING,
                'current_location': 'Local Distribution Hub'
            }
        )

        from .serializers import DeliveryShipmentSerializer
        return Response({
            "order_number": order.order_number,
            "order_status": order.status,
            "shipment": DeliveryShipmentSerializer(shipment).data
        }, status=status.HTTP_200_OK)


class UpdateShipmentStatusView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, order_number):
        from .models import DeliveryShipment, ShipmentStatus
        order = get_object_or_404(Order, order_number=order_number)
        shipment, _ = DeliveryShipment.objects.get_or_create(order=order)

        new_status = request.data.get('status')
        location = request.data.get('location')

        if new_status in ShipmentStatus.values:
            shipment.current_status = new_status
            if location:
                shipment.current_location = location
            shipment.save()

            if new_status == ShipmentStatus.DELIVERED:
                order.status = OrderStatus.DELIVERED
                order.save(update_fields=['status'])
            elif new_status == ShipmentStatus.IN_TRANSIT:
                order.status = OrderStatus.SHIPPED
                order.save(update_fields=['status'])

            from apps.notifications.models import Notification
            Notification.objects.create(
                user=order.user,
                title=f"Delivery Update: {order.order_number}",
                message=f"Your package is now {new_status} at {shipment.current_location}."
            )

            from .serializers import DeliveryShipmentSerializer
            return Response(DeliveryShipmentSerializer(shipment).data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid shipment status"}, status=status.HTTP_400_BAD_REQUEST)


class OrderReturnRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        reason = request.data.get('reason')
        if not reason:
            return Response({"error": "Reason is required to request a return."}, status=status.HTTP_400_BAD_REQUEST)

        from .models import OrderReturn, ReturnStatus
        ret = OrderReturn.objects.create(
            order=order,
            user=request.user,
            reason=reason,
            refund_amount=order.total_amount,
            status=ReturnStatus.REQUESTED
        )

        from .serializers import OrderReturnSerializer
        return Response({
            "detail": "Return request submitted successfully. Our support team is reviewing it.",
            "return": OrderReturnSerializer(ret).data
        }, status=status.HTTP_201_CREATED)


class OrderReturnListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        from .serializers import OrderReturnSerializer
        return OrderReturnSerializer

    def get_queryset(self):
        from .models import OrderReturn
        if self.request.user.is_staff:
            return OrderReturn.objects.all().select_related('order', 'user')
        return OrderReturn.objects.filter(user=self.request.user).select_related('order', 'user')


class OrderReturnModerateView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        from .models import OrderReturn, ReturnStatus
        try:
            ret = OrderReturn.objects.get(id=pk)
        except OrderReturn.DoesNotExist:
            return Response({"error": "Return request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # APPROVE or REJECT
        admin_response = request.data.get('admin_response', '')

        if action == 'APPROVE':
            ret.status = ReturnStatus.REFUNDED
            ret.admin_response = admin_response or "Return approved. Refund processed to original payment method."
            ret.save()

            from apps.notifications.models import Notification
            Notification.objects.create(
                user=ret.user,
                title="Return Approved & Refunded",
                message=f"Your return for Order #{ret.order.order_number} was approved. A refund of ${ret.refund_amount} has been initiated."
            )
            return Response({"detail": "Return approved and marked as refunded."}, status=status.HTTP_200_OK)
        elif action == 'REJECT':
            ret.status = ReturnStatus.REJECTED
            ret.admin_response = admin_response or "Return does not meet warranty criteria."
            ret.save()
            return Response({"detail": "Return request rejected."}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class OrderDigitalInvoiceView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        if not request.user.is_staff and order.user != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        tax_amount = round(float(order.subtotal) * 0.08, 2)
        invoice_data = {
            "invoice_number": f"INV-{order.order_number}",
            "order_number": order.order_number,
            "created_date": order.created_at.strftime("%B %d, %Y"),
            "customer_name": order.user.get_full_name() or order.user.username,
            "customer_email": order.user.email,
            "shipping_address": order.shipping_address,
            "payment_status": "PAID" if order.status in [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] else "PENDING",
            "items": [
                {
                    "product_name": item.product_name,
                    "unit_price": float(item.unit_price),
                    "quantity": item.quantity,
                    "subtotal": float(item.subtotal)
                } for item in order.items.all()
            ],
            "subtotal": float(order.subtotal),
            "tax_amount": tax_amount,
            "shipping_cost": float(order.shipping_cost),
            "discount_amount": float(order.discount_amount),
            "total_amount": float(order.total_amount),
            "company": {
                "name": "SmartCart Retail Inc.",
                "tax_id": "US-TAX-88492019",
                "support_email": "billing@smartcart.com",
                "address": "100 Innovation Blvd, Suite 400, San Francisco, CA 94105"
            }
        }
        return Response(invoice_data, status=status.HTTP_200_OK)

