from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import PriceAlert, StockAlert
from .serializers import PriceAlertSerializer, StockAlertSerializer
from apps.notifications.models import Notification

class PriceAlertListCreateView(generics.ListCreateAPIView):
    serializer_class = PriceAlertSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        alert = serializer.save(user=self.request.user)
        # Check if product is already at or below target price
        if alert.product.current_price <= alert.target_price:
            Notification.objects.create(
                user=self.request.user,
                title=f"Price Alert: {alert.product.name}",
                message=f"Good news! {alert.product.name} is currently ${alert.product.current_price}, meeting your target of ${alert.target_price}!"
            )
            alert.notified_at = timezone.now()
            alert.save(update_fields=['notified_at'])

class PriceAlertDeleteView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)

class StockAlertCreateView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        product_id = request.data.get('product')
        email = request.data.get('email')
        
        user = request.user if request.user.is_authenticated else None
        if not user and not email:
            return Response({"error": "Please provide an email address or log in."}, status=status.HTTP_400_BAD_REQUEST)

        alert, created = StockAlert.objects.get_or_create(
            product_id=product_id,
            user=user,
            email=email or (user.email if user else None),
            defaults={'is_active': True}
        )

        return Response({
            "detail": f"You are subscribed! We will notify you as soon as {alert.product.name} is back in stock.",
            "alert_id": alert.id
        }, status=status.HTTP_201_CREATED)

class CheckPriceAlertsView(APIView):
    """
    Simulates the background price monitoring daemon.
    Checks all active price alerts and sends notifications if criteria are met.
    """
    def post(self, request):
        active_alerts = PriceAlert.objects.filter(is_active=True, notified_at__isnull=True)
        triggered_count = 0

        for alert in active_alerts:
            if alert.product.current_price <= alert.target_price:
                Notification.objects.create(
                    user=alert.user,
                    title=f"Price Drop: {alert.product.name}",
                    message=f"Hurry! {alert.product.name} dropped to ${alert.product.current_price}, which is at or below your target of ${alert.target_price}."
                )
                alert.notified_at = timezone.now()
                alert.save(update_fields=['notified_at'])
                triggered_count += 1

        return Response({
            "detail": f"Price alert monitor run complete. Triggered {triggered_count} alerts.",
            "triggered_count": triggered_count
        }, status=status.HTTP_200_OK)
