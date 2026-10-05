from rest_framework import serializers
from .models import (
    Warehouse,
    WarehouseInventory,
    SellerSettlement,
    Wallet,
    WalletTransaction,
    FraudRiskScore,
    FeatureFlag,
    FeatureExperiment,
    AIModelRegistry,
    DomainEventLog,
    TraceSpan,
    PriceRule,
    CommerceInsight,
    DigitalTwinSimulation,
    AgentRegistry,
    AgentTaskLog,
    PriceCalculationAudit,
    KnowledgeDocument,
    RealTimeDecision,
    WorkflowInstance,
    WorkflowStepExecution,
    OptimizationRecommendation,
    SelfHealingEventLog,
    CrossChannelInteraction,
)

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'

class WarehouseInventorySerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = WarehouseInventory
        fields = ('id', 'warehouse', 'warehouse_name', 'product', 'product_name', 'quantity_on_hand', 'reserved_quantity', 'available_quantity', 'reorder_threshold', 'updated_at')

class SellerSettlementSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = SellerSettlement
        fields = '__all__'

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = '__all__'

class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ('id', 'balance', 'currency', 'is_frozen', 'updated_at', 'transactions')

class FraudRiskScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudRiskScore
        fields = '__all__'

class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = '__all__'

class FeatureExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureExperiment
        fields = '__all__'

class AIModelRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModelRegistry
        fields = '__all__'

class DomainEventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomainEventLog
        fields = '__all__'

class TraceSpanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraceSpan
        fields = '__all__'

class PriceRuleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PriceRule
        fields = '__all__'

class CommerceInsightSerializer(serializers.ModelSerializer):
    authorized_by_username = serializers.CharField(source='authorized_by.username', read_only=True)

    class Meta:
        model = CommerceInsight
        fields = '__all__'

class DigitalTwinSimulationSerializer(serializers.ModelSerializer):
    simulated_by_username = serializers.CharField(source='simulated_by.username', read_only=True)

    class Meta:
        model = DigitalTwinSimulation
        fields = '__all__'

class AgentRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentRegistry
        fields = '__all__'

class AgentTaskLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentTaskLog
        fields = '__all__'

class PriceCalculationAuditSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PriceCalculationAudit
        fields = '__all__'

class KnowledgeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeDocument
        fields = '__all__'


class RealTimeDecisionSerializer(serializers.ModelSerializer):
    authorized_by_username = serializers.CharField(source='authorized_by.username', read_only=True)

    class Meta:
        model = RealTimeDecision
        fields = '__all__'


class WorkflowStepExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStepExecution
        fields = '__all__'


class WorkflowInstanceSerializer(serializers.ModelSerializer):
    steps = WorkflowStepExecutionSerializer(many=True, read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = WorkflowInstance
        fields = '__all__'


class OptimizationRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptimizationRecommendation
        fields = '__all__'


class SelfHealingEventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelfHealingEventLog
        fields = '__all__'


class CrossChannelInteractionSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = CrossChannelInteraction
        fields = '__all__'


