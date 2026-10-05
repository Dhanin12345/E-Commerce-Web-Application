from django.contrib import admin
from apps.nextgen.models import (
    FeatureFlag, Supplier, PurchaseOrder, PurchaseOrderItem,
    Warehouse, WarehouseStock, ARProductAsset, ProductBundle,
    ProductCollection, SocialShareTrack, Subscription, WaitlistEntry,
    UserPrivacyPreference, AuditLog, AIModelMetric, OrderGift
)


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'is_enabled', 'updated_at')
    list_editable = ('is_enabled',)
    search_fields = ('key', 'name')


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'contact_email', 'lead_time_days', 'moq', 'status')
    search_fields = ('name', 'code', 'contact_email')
    list_filter = ('status',)


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'supplier', 'status', 'expected_delivery', 'actual_delivery', 'created_at')
    list_filter = ('status', 'supplier')
    inlines = [PurchaseOrderItemInline]


class WarehouseStockInline(admin.TabularInline):
    model = WarehouseStock
    extra = 1


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'city', 'state', 'capacity', 'is_active')
    inlines = [WarehouseStockInline]


@admin.register(ARProductAsset)
class ARProductAssetAdmin(admin.ModelAdmin):
    list_display = ('product', 'placement_type', 'is_ar_enabled')


@admin.register(ProductBundle)
class ProductBundleAdmin(admin.ModelAdmin):
    list_display = ('name', 'discount_pct', 'is_approved', 'is_active')
    filter_horizontal = ('products',)


@admin.register(ProductCollection)
class ProductCollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'visibility', 'views_count', 'created_at')
    filter_horizontal = ('products',)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'billing_interval', 'status', 'next_billing_date')
    list_filter = ('status', 'billing_interval')


@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ('product', 'email', 'notified', 'joined_at')
    list_filter = ('notified',)


@admin.register(UserPrivacyPreference)
class UserPrivacyPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'analytics_consent', 'marketing_emails', 'data_retention_days')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'target_model', 'user', 'timestamp')
    list_filter = ('target_model', 'action')
    search_fields = ('action', 'target_model')


@admin.register(AIModelMetric)
class AIModelMetricAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'endpoint', 'latency_ms', 'success', 'created_at')
    list_filter = ('model_name', 'success')


@admin.register(OrderGift)
class OrderGiftAdmin(admin.ModelAdmin):
    list_display = ('order', 'recipient_name', 'packaging_type', 'is_gift')
