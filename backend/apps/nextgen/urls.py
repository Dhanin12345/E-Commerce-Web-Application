from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.nextgen.views import (
    CopilotChatView, VisualSearchView, CartOptimizerView,
    CartAbandonmentView, CustomerLifecycleView, SmartInventoryAutomationView,
    SupplierViewSet, PurchaseOrderViewSet, SmartReturnsAnalyticsView,
    CustomerReviewInsightsView, ProductQualityMonitoringView,
    ProductCollectionViewSet, SubscriptionViewSet, WaitlistViewSet,
    DeliveryEstimateView, WarehouseViewSet, FeatureFlagViewSet,
    AdminEventStreamView, AuditLogListView, PrivacyPreferenceView,
    DataExportView, SystemHealthDashboardView, OrderGiftView,
    ProductBundleViewSet, ARAssetViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'bundles', ProductBundleViewSet, basename='bundle')
router.register(r'collections', ProductCollectionViewSet, basename='collection')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'feature-flags', FeatureFlagViewSet, basename='feature-flag')
router.register(r'ar-assets', ARAssetViewSet, basename='ar-asset')

urlpatterns = [
    # 1. AI Shopping Copilot
    path('copilot/', CopilotChatView.as_view(), name='copilot_chat'),

    # 2. Visual Product Search
    path('visual-search/', VisualSearchView.as_view(), name='visual_search'),

    # 5. Smart Cart Optimization
    path('cart/optimize/', CartOptimizerView.as_view(), name='cart_optimize'),

    # 6. Cart Abandonment System
    path('abandoned-carts/', CartAbandonmentView.as_view(), name='abandoned_carts'),

    # 7. Customer Lifecycle Engine
    path('customer-lifecycle/', CustomerLifecycleView.as_view(), name='customer_lifecycle'),

    # 8. Smart Inventory Automation
    path('inventory/automation/', SmartInventoryAutomationView.as_view(), name='inventory_automation'),

    # 11. Smart Returns Analytics
    path('returns-analytics/', SmartReturnsAnalyticsView.as_view(), name='returns_analytics'),

    # 12. Customer Review Insights
    path('reviews/insights/', CustomerReviewInsightsView.as_view(), name='review_insights'),

    # 13. Smart Product Quality Monitoring
    path('quality-monitoring/', ProductQualityMonitoringView.as_view(), name='quality_monitoring'),

    # 17. Gifting
    path('orders/<int:order_id>/gift/', OrderGiftView.as_view(), name='order_gift'),

    # 20. Waitlist
    path('waitlist/join/', WaitlistViewSet.as_view(), name='waitlist_join'),

    # 21. Smart Delivery Estimation
    path('delivery-estimate/', DeliveryEstimateView.as_view(), name='delivery_estimate'),

    # 28. Real-time Admin Event Stream
    path('events/stream/', AdminEventStreamView.as_view(), name='admin_event_stream'),

    # 29. Audit Logs
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs'),

    # 32. Privacy Preferences
    path('privacy/preferences/', PrivacyPreferenceView.as_view(), name='privacy_preferences'),

    # 33. Data Export
    path('privacy/export/', DataExportView.as_view(), name='data_export'),

    # 34. System Health Extended Dashboard
    path('system-health/', SystemHealthDashboardView.as_view(), name='system_health_extended'),

    # Router ViewSets
    path('', include(router.urls)),
]
