from rest_framework import serializers
from apps.products.serializers import ProductSerializer
from apps.nextgen.models import (
    FeatureFlag, Supplier, PurchaseOrder, PurchaseOrderItem,
    Warehouse, WarehouseStock, ARProductAsset, ProductBundle,
    ProductCollection, Subscription, WaitlistEntry,
    UserPrivacyPreference, AuditLog, AIModelMetric, OrderGift
)


class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = ['id', 'key', 'name', 'is_enabled', 'description', 'updated_at']


class SupplierSerializer(serializers.ModelSerializer):
    purchase_orders_count = serializers.IntegerField(source='purchase_orders.count', read_only=True)

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'code', 'contact_email', 'phone', 'lead_time_days', 'moq', 'status', 'purchase_orders_count', 'created_at']


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_cost']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'supplier', 'supplier_name', 'status', 'expected_delivery', 'actual_delivery', 'notes', 'items', 'total_cost', 'created_at']

    def get_total_cost(self, obj):
        return sum(float(i.quantity * i.unit_cost) for i in obj.items.all())


class WarehouseStockSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = WarehouseStock
        fields = ['id', 'product', 'product_name', 'quantity', 'reserved_quantity']


class WarehouseSerializer(serializers.ModelSerializer):
    stocks = WarehouseStockSerializer(many=True, read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'city', 'state', 'country', 'pincode_prefix', 'capacity', 'is_active', 'stocks']


class ARProductAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARProductAsset
        fields = ['id', 'product', 'model_url', 'usdz_url', 'placement_type', 'is_ar_enabled', 'scale']


class ProductBundleSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=ProductBundle.products.field.related_model.objects.all(), source='products'
    )
    bundle_price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductBundle
        fields = ['id', 'name', 'slug', 'description', 'discount_pct', 'is_approved', 'is_active', 'products', 'product_ids', 'original_price', 'bundle_price', 'created_at']

    def get_original_price(self, obj):
        return sum(float(p.price) for p in obj.products.all())

    def get_bundle_price(self, obj):
        orig = self.get_original_price(obj)
        return round(orig * (1.0 - float(obj.discount_pct) / 100.0), 2)


class ProductCollectionSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    products = ProductSerializer(many=True, read_only=True)
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = ProductCollection
        fields = ['id', 'name', 'slug', 'description', 'cover_image', 'visibility', 'share_token', 'creator_username', 'views_count', 'products_count', 'products', 'created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'product', 'product_name', 'product_image', 'product_price', 'billing_interval', 'status', 'next_billing_date', 'discount_pct', 'quantity', 'created_at']
        read_only_fields = ['user']

    def get_product_image(self, obj):
        return obj.product.image.url if obj.product.image else ''


class WaitlistEntrySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = WaitlistEntry
        fields = ['id', 'product', 'product_name', 'email', 'notified', 'joined_at']


class UserPrivacyPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPrivacyPreference
        fields = ['id', 'analytics_consent', 'marketing_emails', 'personalized_recommendations', 'data_retention_days', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = AuditLog
        fields = ['id', 'username', 'action', 'target_model', 'target_id', 'details', 'ip_address', 'timestamp']


class OrderGiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderGift
        fields = ['id', 'order', 'is_gift', 'recipient_name', 'gift_message', 'packaging_type', 'hide_price_tag']
