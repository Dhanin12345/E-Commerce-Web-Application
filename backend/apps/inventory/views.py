from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
import datetime
from .models import InventoryLog, DynamicPricingRule
from .serializers import InventoryLogSerializer, AdjustStockSerializer, DynamicPricingRuleSerializer
from apps.products.models import Product
from apps.orders.models import OrderItem

class InventoryLogListView(generics.ListAPIView):
    queryset = InventoryLog.objects.all().select_related('product')
    serializer_class = InventoryLogSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdjustStockView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    @transaction.atomic
    def post(self, request):
        serializer = AdjustStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = get_object_or_404(Product, id=data['product_id'])
        new_stock = product.stock + data['quantity_change']
        if new_stock < 0:
            return Response({"error": f"Stock cannot fall below zero. Current: {product.stock}"}, status=status.HTTP_400_BAD_REQUEST)

        product.stock = new_stock
        product.save(update_fields=['stock'])

        log = InventoryLog.objects.create(
            product=product,
            change_amount=data['quantity_change'],
            reason=data['reason'],
            resulting_stock=new_stock
        )

        return Response(InventoryLogSerializer(log).data, status=status.HTTP_200_OK)

class DemandForecastingView(APIView):
    """
    Analyzes historical sales velocity, stock levels, and generates:
    - Average Daily Sales
    - Predicted 30-Day Demand
    - Reorder Recommendation
    - Stock Risk Level (OUT_OF_STOCK, LOW_STOCK, HEALTHY, OVERSTOCKED)
    """
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        products = Product.objects.filter(is_active=True).order_by('name')

        forecast_data = []
        for p in products:
            # Total quantity sold in the last 30 days
            sales_qty = OrderItem.objects.filter(
                product=p,
                order__created_at__gte=thirty_days_ago
            ).aggregate(total=Sum('quantity'))['total'] or 0

            # Daily sales velocity (minimum baseline calculation)
            avg_daily_sales = round(sales_qty / 30.0, 2)
            if avg_daily_sales == 0 and sales_qty > 0:
                avg_daily_sales = 0.10

            predicted_30d_demand = round(avg_daily_sales * 30)
            if predicted_30d_demand == 0:
                predicted_30d_demand = max(2, int(p.stock * 0.2))

            # Safety stock is 7 days of sales
            safety_stock = round(avg_daily_sales * 7) or 5
            needed = (predicted_30d_demand + safety_stock) - p.stock
            recommended_reorder = max(0, needed)

            # Determine risk
            if p.stock == 0:
                risk = "OUT_OF_STOCK"
            elif p.stock <= 5 or p.stock < (avg_daily_sales * 5):
                risk = "LOW_STOCK_WARNING"
            elif p.stock > (predicted_30d_demand * 3):
                risk = "OVERSTOCKED"
            else:
                risk = "HEALTHY"

            forecast_data.append({
                "product_id": p.id,
                "name": p.name,
                "sku": p.sku,
                "current_stock": p.stock,
                "thirty_day_sales": sales_qty,
                "avg_daily_sales": avg_daily_sales,
                "predicted_30d_demand": predicted_30d_demand,
                "recommended_reorder": recommended_reorder,
                "risk_level": risk
            })

        return Response(forecast_data, status=status.HTTP_200_OK)

class DynamicPricingRuleListCreateView(generics.ListCreateAPIView):
    queryset = DynamicPricingRule.objects.all().order_by('-created_at')
    serializer_class = DynamicPricingRuleSerializer
    permission_classes = (permissions.IsAdminUser,)

class DynamicPricingRuleDeleteView(generics.DestroyAPIView):
    queryset = DynamicPricingRule.objects.all()
    serializer_class = DynamicPricingRuleSerializer
    permission_classes = (permissions.IsAdminUser,)

class ApplyDynamicPricingView(APIView):
    """
    Applies active dynamic pricing rules to products based on stock levels.
    """
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request):
        active_rules = DynamicPricingRule.objects.filter(is_active=True)
        products = Product.objects.filter(is_active=True)
        updated_count = 0

        for rule in active_rules:
            target_products = products.filter(
                stock__gte=rule.min_stock_threshold,
                stock__lte=rule.max_stock_threshold
            )
            for p in target_products:
                adjustment = float(rule.price_adjustment_pct) / 100.0
                new_discount_price = round(float(p.price) * (1.0 + adjustment), 2)
                if new_discount_price < float(p.price):
                    p.discount_price = new_discount_price
                    p.save(update_fields=['discount_price'])
                    updated_count += 1

        return Response({
            "detail": f"Dynamic pricing applied across active rules. Updated {updated_count} product prices.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)
