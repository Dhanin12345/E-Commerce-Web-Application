from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import uuid

User = get_user_model()


class FeatureFlag(models.Model):
    """Dynamically toggle experimental and next-gen platform features."""
    key = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=120)
    is_enabled = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {'ENABLED' if self.is_enabled else 'DISABLED'}"


class Supplier(models.Model):
    """External vendors/suppliers for inventory restocking."""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Partner'),
        ('INACTIVE', 'Inactive / Paused'),
    ]
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    lead_time_days = models.PositiveIntegerField(default=5, help_text="Average lead time in days")
    moq = models.PositiveIntegerField(default=10, help_text="Minimum Order Quantity")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class PurchaseOrder(models.Model):
    """Automated restocking purchase orders."""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft Recommendation'),
        ('ORDERED', 'PO Sent to Supplier'),
        ('RECEIVED', 'Goods Received & Stock Updated'),
        ('CANCELLED', 'Cancelled'),
    ]
    po_number = models.CharField(max_length=64, unique=True, editable=False)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='DRAFT')
    expected_delivery = models.DateField(null=True, blank=True)
    actual_delivery = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.po_number:
            self.po_number = f"PO-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name} ({self.status})"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} for {self.purchase_order.po_number}"


class Warehouse(models.Model):
    """Multi-warehouse locations for inventory routing."""
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    pincode_prefix = models.CharField(max_length=20, default='*')
    capacity = models.PositiveIntegerField(default=10000)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.city}"


class WarehouseStock(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='warehouse_stocks')
    quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('warehouse', 'product')

    def __str__(self):
        return f"{self.product.name} @ {self.warehouse.name}: {self.quantity} in stock"


class ARProductAsset(models.Model):
    """3D and Augmented Reality configuration for products."""
    SURFACE_CHOICES = [
        ('table', 'Tabletop / Flat Surface'),
        ('floor', 'Floor / Ground'),
        ('wall', 'Wall Mounted'),
        ('face', 'Face / Try-On'),
    ]
    product = models.OneToOneField('products.Product', on_delete=models.CASCADE, related_name='ar_asset')
    model_url = models.CharField(max_length=500, blank=True, help_text="GLB 3D model asset URL")
    usdz_url = models.CharField(max_length=500, blank=True, help_text="iOS USDZ asset URL")
    placement_type = models.CharField(max_length=40, choices=SURFACE_CHOICES, default='table')
    is_ar_enabled = models.BooleanField(default=True)
    scale = models.CharField(max_length=50, default='1 1 1')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AR Asset for {self.product.name}"


class ProductBundle(models.Model):
    """Smart product bundles ('Complete Your Setup')."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2, default=15.0, help_text="Discount percentage for buying bundle")
    is_approved = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    products = models.ManyToManyField('products.Product', related_name='bundles')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) + '-' + uuid.uuid4().hex[:6]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bundle: {self.name} ({self.discount_pct}% off)"


class OrderGift(models.Model):
    """Gifting packaging and personalized notes for orders."""
    PACKAGING_CHOICES = [
        ('STANDARD', 'Standard Eco-Box'),
        ('LUXURY_GIFT_BOX', 'Signature Luxury Ribbon Gift Box (+$4.99)'),
        ('BIRTHDAY_CELEBRATION', 'Celebration Festive Wrap (+$3.99)'),
    ]
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='gift_details')
    is_gift = models.BooleanField(default=True)
    recipient_name = models.CharField(max_length=150)
    gift_message = models.TextField(blank=True)
    packaging_type = models.CharField(max_length=50, choices=PACKAGING_CHOICES, default='LUXURY_GIFT_BOX')
    hide_price_tag = models.BooleanField(default=True)

    def __str__(self):
        return f"Gift for Order #{self.order.order_number} to {self.recipient_name}"


class ProductCollection(models.Model):
    """Curated lists of products created by users or admins."""
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public Collection'),
        ('PRIVATE', 'Private Collection'),
        ('SHAREABLE', 'Shareable via Link'),
    ]
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.CharField(max_length=500, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PUBLIC')
    share_token = models.CharField(max_length=64, unique=True, blank=True)
    products = models.ManyToManyField('products.Product', related_name='collections')
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) + '-' + uuid.uuid4().hex[:6]
        if not self.share_token:
            self.share_token = uuid.uuid4().hex[:12]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Collection: {self.name} by {self.creator.username}"


class SocialShareTrack(models.Model):
    """Tracks social commerce sharing, clicks, and conversions."""
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, null=True, blank=True)
    collection = models.ForeignKey(ProductCollection, on_delete=models.CASCADE, null=True, blank=True)
    channel = models.CharField(max_length=50, default='direct')
    shares_count = models.PositiveIntegerField(default=1)
    clicks_count = models.PositiveIntegerField(default=0)
    conversions_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.product.name if self.product else (self.collection.name if self.collection else 'App')
        return f"ShareTrack [{self.channel}]: {target}"


class Subscription(models.Model):
    """Recurring product subscriptions."""
    INTERVAL_CHOICES = [
        ('WEEKLY', 'Every Week'),
        ('BIWEEKLY', 'Every 2 Weeks'),
        ('MONTHLY', 'Every Month (Subscribe & Save)'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Subscription'),
        ('PAUSED', 'Paused by Customer'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='subscriptions')
    billing_interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES, default='MONTHLY')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    next_billing_date = models.DateField()
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.billing_interval})"


class WaitlistEntry(models.Model):
    """Waitlist for out-of-stock and pre-order products."""
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='waitlist_entries')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='waitlist_entries')
    email = models.EmailField()
    notified = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'email')

    def __str__(self):
        return f"{self.email} on waitlist for {self.product.name}"


class UserPrivacyPreference(models.Model):
    """Data Privacy Center preferences."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='privacy_preference')
    analytics_consent = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)
    personalized_recommendations = models.BooleanField(default=True)
    data_retention_days = models.PositiveIntegerField(default=365)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Privacy Prefs for {self.user.username}"


class AuditLog(models.Model):
    """Advanced audit trail for sensitive administrative and state changes."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100, blank=True)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.action} on {self.target_model}"


class AIModelMetric(models.Model):
    """Tracks latency, invocation counts, token consumption, and errors for AI services."""
    model_name = models.CharField(max_length=100, default='gemini-flash-1.5')
    endpoint = models.CharField(max_length=120)
    latency_ms = models.PositiveIntegerField(default=120)
    tokens_or_items = models.PositiveIntegerField(default=1)
    success = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Metric: {self.model_name} {self.endpoint} ({self.latency_ms}ms)"
