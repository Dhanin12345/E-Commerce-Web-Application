import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

# ============================================================
# 1. MULTI-WAREHOUSE & INVENTORY INTELLIGENCE (Req 15, 17)
# ============================================================

class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=12.9716)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=77.5946)
    capacity_units = models.PositiveIntegerField(default=50000)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class WarehouseInventory(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='inventory_records')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='enterprise_warehouse_stocks')
    quantity_on_hand = models.PositiveIntegerField(default=100)
    reserved_quantity = models.PositiveIntegerField(default=0)
    reorder_threshold = models.PositiveIntegerField(default=20)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('warehouse', 'product')

    @property
    def available_quantity(self):
        return max(0, self.quantity_on_hand - self.reserved_quantity)

    def __str__(self):
        return f"{self.product.name} @ {self.warehouse.code}: {self.available_quantity} avail"

class InventoryReservation(models.Model):
    STATUS_CHOICES = (
        ('RESERVED', 'Reserved'),
        ('CONFIRMED', 'Confirmed / Deducted'),
        ('RELEASED', 'Released / Cancelled'),
        ('EXPIRED', 'Expired'),
    )

    reservation_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RESERVED')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation {self.reservation_id} - {self.quantity}x {self.product.name} ({self.status})"

# ============================================================
# 2. MARKETPLACE COMMISSIONS & SETTLEMENT ENGINE (Req 18, 19)
# ============================================================

class SellerSettlement(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('PROCESSING', 'Processing Payment'),
        ('DISBURSED', 'Disbursed to Seller'),
        ('HELD', 'Held for Review'),
    )

    settlement_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enterprise_settlements')
    order_id = models.PositiveIntegerField()
    gross_sale = models.DecimalField(max_digits=12, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00) # Percentage e.g. 10.00%
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_settlement = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    settlement_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Settlement {self.settlement_id} - Net: {self.net_settlement} ({self.status})"

# ============================================================
# 3. DIGITAL WALLET & STORE CREDIT (Req 20)
# ============================================================

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='enterprise_wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='INR')
    is_frozen = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wallet ({self.user.username}): {self.currency} {self.balance}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Wallet Credit / Top-Up'),
        ('DEBIT', 'Checkout Purchase Debit'),
        ('REFUND', 'Order Refund Credit'),
        ('ADJUSTMENT', 'Administrative Adjustment'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    reference_id = models.CharField(max_length=100, blank=True, default='')
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} (Bal: {self.balance_after})"

# ============================================================
# 4. FRAUD RISK SCORING ENGINE (Req 21)
# ============================================================

class FraudRiskScore(models.Model):
    RISK_LEVELS = (
        ('LOW', 'Low Risk - Automatic Approval'),
        ('MEDIUM', 'Medium Risk - Enhanced Verification'),
        ('HIGH', 'High Risk - Flagged for Review'),
    )

    order_id = models.CharField(max_length=100, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    risk_score = models.IntegerField(default=15) # 0 to 100
    risk_level = models.CharField(max_length=10, choices=RISK_LEVELS, default='LOW')
    reasons = models.JSONField(default=list) # List of contributing risk signals
    action_taken = models.CharField(max_length=50, default='ALLOW')
    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id} Risk: {self.risk_score} ({self.risk_level})"

# ============================================================
# 5. FEATURE FLAGS & EXPERIMENTATION PLATFORM (Req 31, 44)
# ============================================================

class FeatureFlag(models.Model):
    key = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    is_enabled = models.BooleanField(default=True)
    rollout_percentage = models.PositiveIntegerField(default=100) # 0 to 100%
    target_roles = models.JSONField(default=list) # e.g. ["admin", "customer", "beta_tester"]
    variants = models.JSONField(default=dict) # e.g. {"default": true, "v2_layout": false}
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Flag: {self.key} ({'ON' if self.is_enabled else 'OFF'})"

class FeatureExperiment(models.Model):
    experiment_key = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    hypothesis = models.TextField(blank=True)
    variants = models.JSONField(default=list) # ["control", "variant_a", "variant_b"]
    impressions = models.JSONField(default=dict) # {"control": 1200, "variant_a": 1210}
    conversions = models.JSONField(default=dict) # {"control": 84, "variant_a": 112}
    status = models.CharField(max_length=20, default='RUNNING') # DRAFT, RUNNING, CONCLUDED
    winner = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"A/B Experiment: {self.experiment_key} ({self.status})"

# ============================================================
# 6. AI MODEL GOVERNANCE & AUDIT (Req 32, 33)
# ============================================================

class AIModelRegistry(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / Production'),
        ('TESTING', 'Testing / Staging'),
        ('RETIRED', 'Retired / Deprecated'),
    )

    model_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    version = models.CharField(max_length=30, default='1.0.0')
    model_type = models.CharField(max_length=50) # RECOMMENDATION, NLP_AGENT, FRAUD_DETECTION, RAG
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    owner = models.CharField(max_length=100, default='SmartCart Enterprise AI Team')
    input_schema = models.JSONField(default=dict)
    output_schema = models.JSONField(default=dict)
    evaluation_metrics = models.JSONField(default=dict) # e.g. {"accuracy": 0.94, "p99_latency_ms": 42}
    safety_approved = models.BooleanField(default=True)
    deployed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} v{self.version} ({self.status})"

# ============================================================
# 7. DOMAIN EVENT LOG & DISTRIBUTED TRACING (Req 6, 24, 25)
# ============================================================

class DomainEventLog(models.Model):
    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    event_name = models.CharField(max_length=100, db_index=True)
    correlation_id = models.CharField(max_length=100, db_index=True, blank=True, default='')
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default='PROCESSED')
    subscribers_notified = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Event: {self.event_name} [{self.event_id}]"

class TraceSpan(models.Model):
    trace_id = models.CharField(max_length=100, db_index=True)
    span_id = models.CharField(max_length=100)
    parent_span_id = models.CharField(max_length=100, null=True, blank=True)
    service_name = models.CharField(max_length=100, default='api-gateway')
    endpoint = models.CharField(max_length=255)
    http_method = models.CharField(max_length=10)
    status_code = models.IntegerField(default=200)
    duration_ms = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.http_method} {self.endpoint} ({self.duration_ms}ms) [{self.trace_id}]"

# ============================================================
# 8. PRICING RULES & IDEMPOTENCY (Req 14, 27)
# ============================================================

class PriceRule(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pricing_rules')
    rule_name = models.CharField(max_length=150)
    rule_type = models.CharField(max_length=50) # SURGE_PRICING, VOLUME_DISCOUNT, INVENTORY_CLEARANCE
    multiplier = models.DecimalField(max_digits=5, decimal_places=4, default=1.0000)
    fixed_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_inventory_trigger = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.rule_name} (x{self.multiplier})"

class IdempotencyRecord(models.Model):
    idempotency_key = models.CharField(max_length=128, unique=True, db_index=True)
    request_path = models.CharField(max_length=255)
    request_hash = models.CharField(max_length=64)
    response_status = models.IntegerField(default=200)
    response_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Idempotency: {self.idempotency_key}"


# ============================================================
# 9. L11 & L14: AI DECISION SUPPORT & PRESCRIPTIVE COMMERCE
# ============================================================

class CommerceInsight(models.Model):
    CATEGORY_CHOICES = (
        ('INVENTORY', 'Autonomous Inventory'),
        ('PRICING', 'Smart Pricing'),
        ('DEMAND', 'Demand Forecasting'),
        ('MARKETING', 'Customer Intelligence'),
        ('RISK', 'Fraud & Risk Mitigation'),
        ('LOGISTICS', 'Warehouse & Route Optimization'),
    )

    STATUS_CHOICES = (
        ('PENDING_APPROVAL', 'Pending Operator Approval'),
        ('AUTHORIZED', 'Authorized by Operator'),
        ('EXECUTED', 'Executed Successfully'),
        ('DISMISSED', 'Dismissed / Rejected'),
    )

    insight_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='INVENTORY')
    title = models.CharField(max_length=200)
    what = models.TextField(help_text="Observation of current condition")
    why = models.TextField(help_text="Root-cause rationale and signals analysis")
    supporting_signals = models.JSONField(default=dict, help_text="Metrics, velocity, confidence markers")
    confidence = models.FloatField(default=0.92, help_text="AI confidence score 0.0 - 1.0")
    impact_estimate = models.CharField(max_length=150, help_text="Quantified financial/operational upside")
    recommended_action = models.TextField(help_text="Concrete prescriptive operator action")
    affected_entities = models.JSONField(default=list, help_text="Product IDs, Warehouse codes, or Segments")
    requires_authorization = models.BooleanField(default=True, help_text="Safety gate: True requires explicit operator signoff")
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING_APPROVAL')
    model_version = models.CharField(max_length=50, default='gemini-autonomous-v1')
    authorized_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title} ({self.status})"


# ============================================================
# 10. L12: DIGITAL TWIN & COMMERCE SIMULATION ENGINE
# ============================================================

class DigitalTwinSimulation(models.Model):
    SCENARIO_CHOICES = (
        ('DEMAND_SPIKE', 'Demand Surge (+35% Traffic & Orders)'),
        ('SUPPLY_SHOCK', 'Regional Supply Disruption (-50% Inbound)'),
        ('FLASH_SALE_PROMO', 'Flash Sale Promo (20% Off Top Catalog)'),
        ('LOGISTICS_DISRUPTION', 'Carrier Route Delay (+48h Transit)'),
        ('PRICE_ELASTICITY', 'Dynamic Margin Elasticity Test (+10% Price)'),
        ('WAREHOUSE_FAILOVER', 'Hub Failover & Dynamic Re-Routing'),
    )

    simulation_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    scenario_name = models.CharField(max_length=50, choices=SCENARIO_CHOICES)
    input_parameters = models.JSONField(default=dict)
    baseline_metrics = models.JSONField(default=dict)
    predicted_metrics = models.JSONField(default=dict)
    recommendations = models.JSONField(default=list)
    simulated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Simulation: {self.scenario_name} [{self.simulation_id}]"


# ============================================================
# 11. L13: MULTI-AGENT COMMERCE NETWORK
# ============================================================

class AgentRegistry(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / Processing'),
        ('IDLE', 'Idle / Ready'),
        ('BUSY', 'Busy / Heavy Load'),
        ('PAUSED', 'Paused / Standby'),
    )
    GOVERNANCE_LEVELS = (
        (0, 'Level 0: Read-Only (Information Retrieval Only)'),
        (1, 'Level 1: Analysis (Read & Compute Signals)'),
        (2, 'Level 2: Recommendation (Generate Prescriptive Advice)'),
        (3, 'Level 3: User-Confirmed Action (Requires Operator Approval)'),
        (4, 'Level 4: Authorized Automated Action (Bounded Autonomy)'),
    )

    agent_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=150)
    purpose = models.TextField(blank=True, default='')
    governance_level = models.PositiveSmallIntegerField(choices=GOVERNANCE_LEVELS, default=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    allowed_tools = models.JSONField(default=list)
    permissions = models.JSONField(default=list)
    data_access_scope = models.JSONField(default=list) # e.g. ["products:read", "inventory:read"]
    model_name = models.CharField(max_length=100, default='gemini-2.5-enterprise')
    prompt_version = models.CharField(max_length=30, default='v2.5.0')
    maximum_execution_time_sec = models.PositiveIntegerField(default=30)
    allowed_actions = models.JSONField(default=list)
    approval_requirements = models.CharField(max_length=50, default='EXPLICIT_CONFIRMATION')
    audit_policy = models.CharField(max_length=50, default='STRICT_CRYPTOGRAPHIC')
    tasks_completed_count = models.PositiveIntegerField(default=0)
    last_heartbeat = models.DateTimeField(auto_now=True)
    telemetry = models.JSONField(default=dict) # e.g. {"avg_latency_ms": 45, "success_rate": 0.99}

    def __str__(self):
        return f"Agent {self.name} (L{self.governance_level}) - {self.status}"


class AgentTaskLog(models.Model):
    task_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    agent_id = models.CharField(max_length=50, db_index=True)
    trigger_event = models.CharField(max_length=100)
    input_payload = models.JSONField(default=dict)
    tool_invocations = models.JSONField(default=list)
    output_payload = models.JSONField(default=dict)
    execution_status = models.CharField(max_length=30, default='SUCCESS')
    governance_verdict = models.CharField(max_length=30, default='PASSED') # PASSED, BLOCKED, ESCALATED
    audit_hash = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AgentTask {self.task_id} [{self.agent_id}]: {self.execution_status}"


# ============================================================
# 12. L14: AUDITABLE SMART PRICING ENGINE & RAG KNOWLEDGE
# ============================================================

class PriceCalculationAudit(models.Model):
    audit_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pricing_audits')
    rule_applied = models.CharField(max_length=150)
    rule_version = models.CharField(max_length=30, default='2.0.0')
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    computed_price = models.DecimalField(max_digits=12, decimal_places=2)
    signals_used = models.JSONField(default=dict)
    source = models.CharField(max_length=100, default='Autonomous Pricing Engine L14')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PriceAudit {self.product.name}: {self.base_price} -> {self.computed_price}"


class KnowledgeDocument(models.Model):
    CATEGORY_CHOICES = (
        ('SPECIFICATION', 'Product Technical Specifications'),
        ('FAQ', 'Customer FAQ'),
        ('WARRANTY', 'Enterprise Warranty Policy'),
        ('RETURN_POLICY', 'Return & Refund Guidelines'),
        ('SHIPPING_POLICY', 'Fulfillment & SLA Policy'),
        ('SELLER_GUIDE', 'Marketplace Seller Compliance'),
    )

    doc_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='FAQ')
    content = models.TextField()
    source_url = models.CharField(max_length=255, blank=True, default='')
    chunk_count = models.PositiveIntegerField(default=1)
    embedding_model = models.CharField(max_length=100, default='text-embedding-004')
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"


# ============================================================
# 13. L16 & L17: REAL-TIME DECISION INTELLIGENCE
# ============================================================

class RealTimeDecision(models.Model):
    DECISION_TYPES = (
        ('PRICING', 'Dynamic Pricing Adjustment'),
        ('INVENTORY', 'Automated Reorder & Allocation'),
        ('FRAUD', 'Real-Time Fraud Assessment'),
        ('ROUTING', 'Optimal Warehouse Routing'),
        ('DISCOUNT', 'Personalized Promotion Trigger'),
        ('RETENTION', 'Customer Churn Prevention Offer'),
        ('SELF_HEAL', 'Infrastructure Degradation Fallback'),
        ('WORKFLOW', 'Business Process Step Advancement'),
    )

    AUTHORIZATION_STATUS = (
        ('PENDING', 'Pending Operator Approval'),
        ('AUTHORIZED', 'Authorized by Operator'),
        ('AUTO_APPROVED', 'Auto-Approved (Level 4 Policy Bounded)'),
        ('REJECTED', 'Rejected / Overridden'),
        ('EXECUTED', 'Executed Successfully'),
    )

    decision_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    event_id = models.CharField(max_length=100, db_index=True)
    decision_type = models.CharField(max_length=30, choices=DECISION_TYPES)
    input_signals = models.JSONField(default=dict)
    rules_used = models.JSONField(default=list)
    model_version = models.CharField(max_length=50, default='decision-intelligence-v2.5')
    confidence = models.FloatField(default=0.95)
    recommendation = models.JSONField(default=dict)
    authorization_status = models.CharField(max_length=25, choices=AUTHORIZATION_STATUS, default='PENDING')
    authorized_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Decision {self.decision_id} [{self.decision_type}]: {self.authorization_status}"


# ============================================================
# 14. L18: AUTONOMOUS BUSINESS PROCESS ORCHESTRATION
# ============================================================

class WorkflowInstance(models.Model):
    WORKFLOW_TYPES = (
        ('ORDER_FULFILLMENT', 'End-to-End Order Fulfillment Lifecycle'),
        ('INVENTORY_REORDER', 'Automated Warehouse Reorder & Allocation'),
        ('RETURN_RESOLUTION', 'Intelligent Return & Instant Refund'),
        ('SELLER_ONBOARDING', 'Marketplace Seller Verification & Compliance'),
        ('INCIDENT_FAILOVER', 'Disaster Recovery & Multi-Hub Failover'),
    )

    STATUS_CHOICES = (
        ('INITIATED', 'Workflow Initiated'),
        ('RUNNING', 'Running Steps'),
        ('PENDING_APPROVAL', 'Paused for Manual Operator Approval'),
        ('COMPLETED', 'Completed Successfully'),
        ('FAILED', 'Failed at Step'),
        ('COMPENSATING', 'Rolling Back / Executing Compensations'),
        ('ROLLED_BACK', 'Compensations Applied / Reverted'),
    )

    workflow_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    workflow_type = models.CharField(max_length=50, choices=WORKFLOW_TYPES)
    reference_id = models.CharField(max_length=100, db_index=True) # e.g. order_id or sku
    current_step = models.CharField(max_length=100, default='START')
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='INITIATED')
    context_data = models.JSONField(default=dict)
    requires_approval = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    rollback_plan = models.JSONField(default=list)
    audit_trail = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Workflow {self.workflow_type} ({self.reference_id}): {self.status}"


class WorkflowStepExecution(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Execution'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed Successfully'),
        ('FAILED', 'Failed'),
        ('COMPENSATED', 'Rolled Back / Compensated'),
        ('SKIPPED', 'Skipped by Condition'),
    )

    step_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    workflow = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='steps')
    step_name = models.CharField(max_length=100)
    sequence_order = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    input_payload = models.JSONField(default=dict)
    output_payload = models.JSONField(default=dict)
    error_message = models.TextField(blank=True, default='')
    compensation_action = models.CharField(max_length=150, blank=True, default='')
    compensation_executed = models.BooleanField(default=False)
    duration_ms = models.FloatField(default=0.0)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence_order']

    def __str__(self):
        return f"Step {self.sequence_order}: {self.step_name} [{self.status}]"


# ============================================================
# 15. L20: SELF-OPTIMIZING PLATFORM
# ============================================================

class OptimizationRecommendation(models.Model):
    STATUS_CHOICES = (
        ('PROPOSED', 'Proposed by Optimizer'),
        ('AUTHORIZED', 'Authorized by Operator'),
        ('APPLIED', 'Configuration Applied Live'),
        ('REJECTED', 'Dismissed by Operator'),
    )

    recommendation_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    target_subsystem = models.CharField(max_length=100) # API_GATEWAY, SEARCH_RANKING, CACHE_LAYER, DB_INDEX, RECOMMENDATIONS
    bottleneck_detected = models.CharField(max_length=255)
    metric_name = models.CharField(max_length=100)
    current_value = models.FloatField(default=0.0)
    target_value = models.FloatField(default=0.0)
    recommended_configuration = models.JSONField(default=dict)
    projected_impact = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROPOSED')
    applied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Optimization ({self.target_subsystem}): {self.bottleneck_detected} [{self.status}]"


# ============================================================
# 16. L21: SELF-HEALING INFRASTRUCTURE
# ============================================================

class SelfHealingEventLog(models.Model):
    STATUS_CHOICES = (
        ('RESOLVED', 'Auto-Healed & Restored'),
        ('IN_PROGRESS', 'Remediation Underway'),
        ('ESCALATED_ADMIN', 'Escalated to Infrastructure Admin'),
    )

    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    subsystem = models.CharField(max_length=100) # RECOMMENDATION_SERVICE, AI_GATEWAY, DB_POOL, SEARCH_CLUSTER, QUEUE_WORKER
    issue_detected = models.CharField(max_length=255)
    health_status_before = models.CharField(max_length=50) # DEGRADED, FAILING, TIMEOUT, UNREACHABLE
    healing_action_taken = models.CharField(max_length=255) # CACHE_FALLBACK_ENGAGED, CIRCUIT_TRIPPED, WORKER_AUTO_RECOVERED, QUEUE_DRAINED
    fallback_mode_active = models.BooleanField(default=True)
    health_status_after = models.CharField(max_length=50, default='RECOVERED')
    telemetry = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SelfHealing [{self.subsystem}]: {self.healing_action_taken} ({self.health_status_after})"


# ============================================================
# 17. L24: CROSS-CHANNEL INTELLIGENCE
# ============================================================

class CrossChannelInteraction(models.Model):
    CHANNEL_CHOICES = (
        ('WEB', 'Web Storefront (Desktop/Tablet)'),
        ('MOBILE_APP', 'Native Mobile App (iOS/Android)'),
        ('PWA', 'Progressive Web App'),
        ('VOICE', 'Voice Shopping Assistant'),
        ('SOCIAL', 'Social Commerce (Instagram/WhatsApp)'),
        ('EMAIL', 'Interactive Email & Re-engagement'),
        ('IN_STORE', 'Physical Store Smart Kiosk'),
        ('PARTNER', 'Partner Marketplace Channel'),
    )

    interaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cross_channel_interactions')
    session_id = models.CharField(max_length=128, db_index=True)
    channel = models.CharField(max_length=30, choices=CHANNEL_CHOICES, default='WEB')
    interaction_type = models.CharField(max_length=50) # SEARCH, VIEW_PRODUCT, ADD_TO_CART, VOICE_QUERY, CHECKOUT, PURCHASE
    payload = models.JSONField(default=dict)
    synced_to_profile = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.channel}] {self.interaction_type} (Session: {self.session_id[:8]}...)"


# ============================================================
# 18. L26: CONTEXT-AWARE COMMERCE
# ============================================================

class ContextualSessionProfile(models.Model):
    DEVICE_CHOICES = (
        ('DESKTOP', 'Desktop / High-Res'),
        ('MOBILE', 'Mobile Smartphone'),
        ('TABLET', 'Tablet Device'),
        ('KIOSK', 'In-Store Kiosk'),
        ('VOICE', 'Voice Assistant Device'),
    )

    INTENT_CHOICES = (
        ('BARGAIN_HUNTER', 'Bargain Hunter / Price Sensitive'),
        ('URGENT_REPLACEMENT', 'Urgent / Same-Day Needed'),
        ('RESEARCHER', 'Detailed Spec Researcher'),
        ('IMPULSE_BUYER', 'High-Affinity Impulse Buyer'),
        ('ROUTINE_REORDER', 'Routine Replenishment'),
    )

    profile_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    session_id = models.CharField(max_length=128, unique=True, db_index=True)
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contextual_profiles')
    device_category = models.CharField(max_length=20, choices=DEVICE_CHOICES, default='DESKTOP')
    temporal_context = models.JSONField(default=dict)
    environmental_context = models.JSONField(default=dict)
    momentum_score = models.FloatField(default=0.5)
    contextual_intent = models.CharField(max_length=30, choices=INTENT_CHOICES, default='RESEARCHER')
    dynamic_modifiers = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ContextProfile [{self.session_id[:8]}] - Intent: {self.contextual_intent} (Momentum: {self.momentum_score:.2f})"


# ============================================================
# 19. L27: COMMERCE DATA FABRIC
# ============================================================

class DataLineageRecord(models.Model):
    OPERATION_CHOICES = (
        ('INSERT', 'Insert Mutation'),
        ('UPDATE', 'Update Mutation'),
        ('DELETE', 'Delete / Archive'),
        ('CDC_SYNC', 'Change Data Capture Sync'),
    )

    STATUS_CHOICES = (
        ('SYNCED', 'Fully Synchronized Across Tiers'),
        ('LAGGING', 'Replication Lag Detected'),
        ('FAILED', 'Replication Failed'),
    )

    lineage_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    source_entity = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100)
    operation = models.CharField(max_length=20, choices=OPERATION_CHOICES, default='CDC_SYNC')
    source_tier = models.CharField(max_length=50, default='TRANSACTIONAL_SQL')
    target_tiers = models.JSONField(default=list)
    sync_latency_ms = models.FloatField(default=12.5)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SYNCED')
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lineage [{self.source_entity}:{self.entity_id}] {self.operation} -> {self.status}"


class DataQualityReport(models.Model):
    scan_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    dataset_name = models.CharField(max_length=100)
    completeness_score = models.FloatField(default=99.4)
    consistency_score = models.FloatField(default=98.8)
    validity_score = models.FloatField(default=99.9)
    orphan_records_detected = models.PositiveIntegerField(default=0)
    anomalies = models.JSONField(default=list)
    remediation_suggestions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DataQuality [{self.dataset_name}] Valid: {self.validity_score}% Orphans: {self.orphan_records_detected}"


# ============================================================
# 20. L28: AI MODEL OPERATIONS PLATFORM (ModelOps / MLOps)
# ============================================================

class ModelDeploymentPolicy(models.Model):
    STRATEGY_CHOICES = (
        ('CANARY_10_90', 'Canary 10/90 Rollout'),
        ('SHADOW_MIRROR', 'Shadow Mirror (Dark Traffic)'),
        ('CHAMPION_ACTIVE', 'Champion 100% Active'),
        ('ROLLED_BACK', 'Auto Rolled Back to Fallback'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active in Production'),
        ('DEGRADED', 'Performance Degradation Detected'),
        ('AUTO_ROLLED_BACK', 'Safety Circuit Triggered Rollback'),
        ('ARCHIVED', 'Retired Model Version'),
    )

    policy_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    model_name = models.CharField(max_length=100, db_index=True)
    task_type = models.CharField(max_length=50)
    deployment_strategy = models.CharField(max_length=30, choices=STRATEGY_CHOICES, default='CANARY_10_90')
    champion_version = models.CharField(max_length=50, default='v3.2.0')
    challenger_version = models.CharField(max_length=50, blank=True, default='v3.3.0-rc1')
    traffic_split_percentage = models.PositiveIntegerField(default=90)
    error_rate_threshold = models.FloatField(default=0.02)
    latency_sla_ms = models.FloatField(default=120.0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ModelPolicy [{self.model_name}] Champion:{self.champion_version} / Challenger:{self.challenger_version} ({self.status})"


class ModelEvaluationRun(models.Model):
    run_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    model_name = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    dataset_name = models.CharField(max_length=100)
    ndcg_score = models.FloatField(null=True, blank=True, default=0.884)
    precision_at_k = models.FloatField(null=True, blank=True, default=0.912)
    mrr_score = models.FloatField(null=True, blank=True, default=0.845)
    factual_grounding_score = models.FloatField(null=True, blank=True, default=0.998)
    avg_latency_ms = models.FloatField(default=42.5)
    drift_detected = models.BooleanField(default=False)
    drift_metrics = models.JSONField(default=dict)
    passed_quality_gate = models.BooleanField(default=True)
    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ModelEval [{self.model_name}:{self.version}] NDCG:{self.ndcg_score} Grounding:{self.factual_grounding_score}"


# ============================================================
# 21. L29: AUTONOMOUS BUSINESS INTELLIGENCE
# ============================================================

class ExecutiveBriefingRecord(models.Model):
    PERIOD_CHOICES = (
        ('DAILY', 'Daily Executive Brief'),
        ('WEEKLY', 'Weekly Commercial Summary'),
        ('MONTHLY', 'Monthly Platform Retrospective'),
    )

    briefing_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=200)
    executive_summary = models.TextField()
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='DAILY')
    kpis = models.JSONField(default=dict)
    key_drivers = models.JSONField(default=list)
    recommended_actions = models.JSONField(default=list)
    confidence = models.FloatField(default=0.95)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Briefing [{self.period}] {self.title}"


class BusinessGoalTarget(models.Model):
    STATUS_CHOICES = (
        ('ON_TRACK', 'On Track (>= 95% pacing)'),
        ('AT_RISK', 'At Risk (80% - 94% pacing)'),
        ('BEHIND', 'Behind Target (< 80% pacing)'),
        ('EXCEEDED', 'Target Exceeded (> 105%)'),
    )

    goal_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    metric_name = models.CharField(max_length=100)
    target_value = models.FloatField()
    current_value = models.FloatField()
    pacing_percentage = models.FloatField(default=100.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ON_TRACK')
    deadline = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Goal [{self.metric_name}] Target: {self.target_value} | Current: {self.current_value} ({self.status})"


# ============================================================
# 22. L30: NEXT-GEN COMMERCE OPERATING PLATFORM (Master Kernel)
# ============================================================

class PlatformSlaAudit(models.Model):
    STATUS_CHOICES = (
        ('COMPLIANT', 'Strictly Compliant with Enterprise SLA'),
        ('WARNING', 'Approaching SLA Threshold'),
        ('BREACHED', 'SLA Contract Breached'),
    )

    audit_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    subsystem = models.CharField(max_length=100)
    measured_availability = models.FloatField(default=99.99)
    measured_p99_latency_ms = models.FloatField(default=85.0)
    breaches_detected = models.PositiveIntegerField(default=0)
    sla_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLIANT')
    telemetry_window = models.CharField(max_length=50, default='Last 24 Hours')
    audited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SLA [{self.subsystem}] Avail: {self.measured_availability}% p99: {self.measured_p99_latency_ms}ms ({self.sla_status})"


class SystemDisasterRecoverySnapshot(models.Model):
    TYPE_CHOICES = (
        ('SCHEDULED', 'Automated Daily DR State Snapshot'),
        ('PRE_DEPLOYMENT', 'Pre-Deployment Baseline Snapshot'),
        ('INCIDENT_DRILL', 'Simulated Disaster Recovery Drill'),
    )

    STATUS_CHOICES = (
        ('VERIFIED_HEALTHY', 'Verified Cryptographically Intact'),
        ('CORRUPTED', 'Integrity Hash Mismatch'),
        ('PENDING', 'Verification Pending'),
    )

    snapshot_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    snapshot_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='SCHEDULED')
    state_hash = models.CharField(max_length=64)
    rpo_seconds = models.FloatField(default=0.0)
    rto_seconds = models.FloatField(default=1.8)
    tables_preserved = models.JSONField(default=dict)
    verification_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='VERIFIED_HEALTHY')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DR Snapshot [{self.snapshot_type}] Hash: {self.state_hash[:8]}... ({self.verification_status})"



