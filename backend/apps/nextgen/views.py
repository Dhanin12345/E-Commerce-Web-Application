import csv
import json
from datetime import date, timedelta
from django.db.models import Avg, Count
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order
from apps.nextgen.models import (
    FeatureFlag, Supplier, PurchaseOrder, PurchaseOrderItem,
    Warehouse, WarehouseStock, ARProductAsset, ProductBundle,
    ProductCollection, Subscription, WaitlistEntry,
    UserPrivacyPreference, AuditLog, OrderGift
)
from apps.nextgen.serializers import (
    FeatureFlagSerializer, SupplierSerializer, PurchaseOrderSerializer,
    WarehouseSerializer, ARProductAssetSerializer, ProductBundleSerializer,
    ProductCollectionSerializer, SubscriptionSerializer, WaitlistEntrySerializer,
    UserPrivacyPreferenceSerializer, AuditLogSerializer, OrderGiftSerializer
)
from apps.nextgen.services import (
    CopilotService, VisualSearchService, SmartCartOptimizerService,
    CartAbandonmentService, CustomerLifecycleService, SmartInventoryAutomationService,
    SmartReturnsAnalyticsService, CustomerReviewInsightsService,
    SmartDeliveryEstimationService, DataPrivacyAndExportService,
    SystemHealthMonitorService
)
from apps.nextgen.events import (
    EventDispatcher, ADMIN_EVENT_STREAM,
    EVENT_ORDER_CREATED, EVENT_PRODUCT_BACK_IN_STOCK
)


class CopilotChatView(APIView):
    """1. AI Shopping Copilot natural language processing."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response({'error': 'Query text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = CopilotService.process_query(query, request.user)
        return Response(result)


class VisualSearchView(APIView):
    """2. Visual Product Search with image upload & similarity scoring."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        image_file = request.FILES.get('image')
        filename = request.data.get('filename', '')
        
        if not image_file and not filename:
            return Response({'error': 'Please upload an image file.'}, status=status.HTTP_400_BAD_REQUEST)

        fname = image_file.name if image_file else filename
        result = VisualSearchService.search_by_image(image_file, fname)
        if not result.get('success'):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)


class ARAssetViewSet(viewsets.ModelViewSet):
    """3. AR / Virtual Preview 3D Asset Management."""
    queryset = ARProductAsset.objects.select_related('product').all()
    serializer_class = ARProductAssetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProductBundleViewSet(viewsets.ModelViewSet):
    """4. Smart Product Bundles ('Complete Your Setup')."""
    queryset = ProductBundle.objects.filter(is_active=True).prefetch_related('products')
    serializer_class = ProductBundleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_to_cart(self, request, pk=None):
        bundle = self.get_object()
        cart, _ = Cart.objects.get_or_create(user=request.user)
        added_count = 0
        for prod in bundle.products.filter(is_active=True):
            item, created = CartItem.objects.get_or_create(cart=cart, product=prod)
            if not created:
                item.quantity += 1
                item.save()
            added_count += 1
        return Response({'message': f'Successfully added {added_count} items from bundle "{bundle.name}" to cart!'})


class CartOptimizerView(APIView):
    """5. Smart Cart Optimization (Free shipping bar, bundle hints, accessories)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = SmartCartOptimizerService.optimize_cart(request.user)
        return Response(data)


class CartAbandonmentView(APIView):
    """6. Cart Abandonment System for inactive carts."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        abandoned = CartAbandonmentService.detect_abandoned_carts()
        return Response({'count': len(abandoned), 'abandoned_carts': abandoned})


class CustomerLifecycleView(APIView):
    """7. Customer Lifecycle Engine (NEW, ACTIVE, RETURNING, INACTIVE)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = CustomerLifecycleService.get_lifecycle_analytics()
        return Response(data)


class SmartInventoryAutomationView(APIView):
    """8. Smart Inventory Automation with sales velocity & depletion projections."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        recommendations = SmartInventoryAutomationService.get_inventory_recommendations()
        return Response({'recommendations': recommendations})


class SupplierViewSet(viewsets.ModelViewSet):
    """9. Supplier Management CRUD & performance tracking."""
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAdminUser]


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """10. Purchase Order System with restock fulfillment."""
    queryset = PurchaseOrder.objects.select_related('supplier').prefetch_related('items__product').all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        po = self.get_object()
        if po.status == 'RECEIVED':
            return Response({'error': 'Purchase order has already been received.'}, status=status.HTTP_400_BAD_REQUEST)
        
        po.status = 'RECEIVED'
        po.actual_delivery = date.today()
        po.save()

        # Update product stock
        restocked_summary = []
        for item in po.items.all():
            item.product.stock += item.quantity
            item.product.save()
            restocked_summary.append(f"{item.product.name} (+{item.quantity})")
            EventDispatcher.emit(EVENT_PRODUCT_BACK_IN_STOCK, {'product_id': item.product.id})

        return Response({
            'message': f"Purchase Order {po.po_number} received! Restocked items: {', '.join(restocked_summary)}.",
            'po_status': po.status
        })


class SmartReturnsAnalyticsView(APIView):
    """11. Smart Returns Analytics."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = SmartReturnsAnalyticsService.get_returns_dashboard()
        return Response(data)


class CustomerReviewInsightsView(APIView):
    """12. Customer Review Insights & sentiment breakdown."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        data = CustomerReviewInsightsService.get_insights(product_id)
        return Response(data)


class ProductQualityMonitoringView(APIView):
    """13. Smart Product Quality Monitoring (NORMAL, MONITOR, REVIEW_REQUIRED)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        products = Product.objects.filter(is_active=True).annotate(
            avg_rating=Avg('reviews__rating'),
            rev_count=Count('reviews')
        )[:15]

        items = []
        for p in products:
            rating = float(p.avg_rating or p.rating_avg)
            if rating < 3.5:
                quality_status = 'REVIEW REQUIRED'
                recommendation = 'Investigate high defect rate or negative reviews'
            elif rating < 4.2 or p.stock < 5:
                quality_status = 'MONITOR'
                recommendation = 'Monitor incoming buyer feedback'
            else:
                quality_status = 'NORMAL'
                recommendation = 'Quality metrics healthy'

            items.append({
                'product_id': p.id,
                'product_name': p.name,
                'rating': rating,
                'reviews_count': p.rev_count,
                'current_stock': p.stock,
                'status': quality_status,
                'recommendation': recommendation
            })
        return Response({'products': items})


class ProductCollectionViewSet(viewsets.ModelViewSet):
    """16. Product Collections ('Gaming Setup', 'Home Office')."""
    queryset = ProductCollection.objects.prefetch_related('products').all().order_by('-created_at')
    serializer_class = ProductCollectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-token/(?P<token>[^/.]+)')
    def by_token(self, request, token=None):
        try:
            col = ProductCollection.objects.get(share_token=token)
            col.views_count += 1
            col.save()
            return Response(ProductCollectionSerializer(col).data)
        except ProductCollection.DoesNotExist:
            return Response({'error': 'Collection not found'}, status=status.HTTP_404_NOT_FOUND)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """18. Subscription Products (Weekly, Bi-Weekly, Monthly)."""
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).select_related('product').order_by('-created_at')

    def perform_create(self, serializer):
        next_date = date.today() + timedelta(days=30)
        serializer.save(user=self.request.user, next_billing_date=next_date)

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        sub = self.get_object()
        sub.status = 'PAUSED'
        sub.save()
        return Response({'message': 'Subscription paused.', 'status': sub.status})

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        sub = self.get_object()
        sub.status = 'ACTIVE'
        sub.save()
        return Response({'message': 'Subscription resumed.', 'status': sub.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sub = self.get_object()
        sub.status = 'CANCELLED'
        sub.save()
        return Response({'message': 'Subscription cancelled.', 'status': sub.status})


class WaitlistViewSet(APIView):
    """20. Waitlist System for out-of-stock and pre-order products."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        product_id = request.data.get('product_id')
        email = request.data.get('email', '').strip()
        if not product_id or not email:
            return Response({'error': 'Product ID and email are required.'}, status=status.HTTP_400_BAD_REQUEST)

        entry, created = WaitlistEntry.objects.get_or_create(
            product_id=product_id,
            email=email,
            defaults={'user': request.user if request.user.is_authenticated else None}
        )
        return Response({
            'message': 'Successfully joined the waitlist!' if created else 'You are already on the waitlist for this product.',
            'product_id': product_id,
            'email': email
        })


class DeliveryEstimateView(APIView):
    """21. Smart Delivery Estimation date range."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        pincode = request.query_params.get('pincode', '560001')
        method = request.query_params.get('method', 'STANDARD').upper()
        estimate = SmartDeliveryEstimationService.estimate_delivery(pincode, method)
        return Response(estimate)


class WarehouseViewSet(viewsets.ReadOnlyModelViewSet):
    """22. Multi-Warehouse inventory view."""
    queryset = Warehouse.objects.filter(is_active=True).prefetch_related('stocks__product')
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAdminUser]


class FeatureFlagViewSet(viewsets.ModelViewSet):
    """25. Feature Flag System for dynamic toggles."""
    queryset = FeatureFlag.objects.all().order_by('key')
    serializer_class = FeatureFlagSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request):
        """Expose enabled feature flags to client applications."""
        flags = FeatureFlag.objects.filter(is_enabled=True)
        return Response({f.key: True for f in flags})


class AdminEventStreamView(APIView):
    """28. Real-time Collaborative Admin System event stream."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        events = list(ADMIN_EVENT_STREAM)
        return Response({'events': events})


class AuditLogListView(APIView):
    """29. Advanced Audit System logs."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        logs = AuditLog.objects.select_related('user')[:50]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class PrivacyPreferenceView(APIView):
    """32. Data Privacy Center preferences."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pref, _ = UserPrivacyPreference.objects.get_or_create(user=request.user)
        return Response(UserPrivacyPreferenceSerializer(pref).data)

    def put(self, request):
        pref, _ = UserPrivacyPreference.objects.get_or_create(user=request.user)
        serializer = UserPrivacyPreferenceSerializer(pref, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DataExportView(APIView):
    """33. Customer Data Export in JSON or CSV format."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        export_format = request.query_params.get('format', 'json').lower()
        data = DataPrivacyAndExportService.export_user_data(request.user)

        if export_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="smartcart-data-{request.user.username}.csv"'
            writer = csv.writer(response)
            writer.writerow(['Category', 'Field', 'Value'])
            for k, v in data['profile'].items():
                writer.writerow(['Profile', k, v])
            for k, v in data['privacy_preferences'].items():
                writer.writerow(['Privacy', k, v])
            for o in data['orders']:
                writer.writerow(['Order', o['order_number'], f"{o['status']} - ${o['total_amount']}"])
            return response

        return Response(data)


class SystemHealthDashboardView(APIView):
    """34. System Health Dashboard for all architectural subsystems."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        health = SystemHealthMonitorService.check_all_services()
        return Response(health)


class OrderGiftView(APIView):
    """17. Order Gifting personalization and packaging."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        gift, _ = OrderGift.objects.get_or_create(order=order)
        serializer = OrderGiftSerializer(gift, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
