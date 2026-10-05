from django.urls import path
from .views import (
    GatewayMetricsView,
    GraphQLView,
    CQRSCommandView,
    CQRSQueryView,
    DomainEventLogView,
    CircuitBreakerControlView,
    AIShoppingAgentView,
    RAGAssistantView,
    VectorSearchView,
    MultiModalSearchView,
    WarehouseListView,
    WarehouseInventoryListView,
    WarehouseRoutingOptimizeView,
    SellerSettlementListView,
    WalletDetailView,
    FraudEvaluationView,
    FeatureFlagListView,
    FeatureFlagToggleView,
    AIModelRegistryListView,
    DynamicPricingCalculateView,
    AutonomousIntelligenceSummaryView,
    CommerceInsightListView,
    CommerceInsightAuthorizeView,
    DigitalTwinSimulationView,
    AgentNetworkView,
    AgentTaskDispatchView,
    SmartPricingAuditListView,
    RealTimeDecisionStreamView,
    RealTimeDecisionActionView,
    AutonomousWorkflowView,
    AutonomousWorkflowActionView,
    SelfOptimizingPlatformView,
    SelfHealingResilienceView,
    AgentGovernancePlatformView,
    EnterpriseKnowledgeGraphView,
    CrossChannelIntelligenceView,
    AutonomousCommerceOSOverviewView,
    AIContextEngineQueryView,
    AdvancedSearchRankingView,
    ContextAwareCommerceView,
    ContextualCatalogView,
    CommerceDataFabricView,
    DataQualityScanView,
    ModelOperationsView,
    ModelRollbackView,
    AutonomousBIView,
    AutonomousBINLQueryView,
    CommerceOperatingPlatformView,
    DisasterRecoverySnapshotView,
    EnterpriseDashboardSummaryView,
    EnterpriseDashboardAnalyticsView,
    EnterpriseDashboardAIInsightsView,
    EnterpriseDashboardAuditSecurityView,
    EnterpriseDashboardAIAssistantView,
)

urlpatterns = [
    # API Gateway & Observability
    path('metrics/', GatewayMetricsView.as_view(), name='enterprise_metrics'),
    path('graphql/', GraphQLView.as_view(), name='enterprise_graphql'),
    
    # CQRS Architecture
    path('cqrs/commands/', CQRSCommandView.as_view(), name='cqrs_commands'),
    path('cqrs/queries/', CQRSQueryView.as_view(), name='cqrs_queries'),

    # Event-Driven Architecture & Resilience
    path('events/', DomainEventLogView.as_view(), name='domain_events'),
    path('resilience/breakers/', CircuitBreakerControlView.as_view(), name='circuit_breakers'),

    # AI Intelligence Platform
    path('ai/agent/', AIShoppingAgentView.as_view(), name='ai_shopping_agent'),
    path('ai/rag/', RAGAssistantView.as_view(), name='ai_rag_assistant'),
    path('ai/vector-search/', VectorSearchView.as_view(), name='vector_search'),
    path('ai/multimodal/', MultiModalSearchView.as_view(), name='multimodal_search'),
    path('ai/models/', AIModelRegistryListView.as_view(), name='ai_model_registry'),

    # Multi-Warehouse & Fulfillment
    path('warehouses/', WarehouseListView.as_view(), name='warehouses_list'),
    path('warehouses/inventory/', WarehouseInventoryListView.as_view(), name='warehouses_inventory'),
    path('warehouses/optimize-routing/', WarehouseRoutingOptimizeView.as_view(), name='warehouses_routing'),

    # Marketplace & Settlements
    path('settlements/', SellerSettlementListView.as_view(), name='seller_settlements'),

    # Digital Wallet / Store Credit
    path('wallet/', WalletDetailView.as_view(), name='digital_wallet'),

    # Fraud Risk Scoring
    path('fraud/evaluate/', FraudEvaluationView.as_view(), name='fraud_evaluate'),

    # Feature Flags & A/B Testing
    path('flags/', FeatureFlagListView.as_view(), name='feature_flags'),
    path('flags/<slug:key>/toggle/', FeatureFlagToggleView.as_view(), name='feature_flag_toggle'),

    # Real-Time Pricing Engine & Audits
    path('pricing/calculate/', DynamicPricingCalculateView.as_view(), name='pricing_calculate'),
    path('pricing/audits/', SmartPricingAuditListView.as_view(), name='smart_pricing_audits'),

    # L11: Autonomous Commerce Intelligence
    path('autonomous/summary/', AutonomousIntelligenceSummaryView.as_view(), name='autonomous_summary'),

    # L11 & L14: AI Decision Support & Prescriptive Actions
    path('insights/', CommerceInsightListView.as_view(), name='commerce_insights'),
    path('insights/<uuid:insight_id>/action/', CommerceInsightAuthorizeView.as_view(), name='commerce_insight_action'),

    # L12: Digital Twin & Commerce Simulation
    path('simulation/', DigitalTwinSimulationView.as_view(), name='digital_twin_simulation'),

    # L13: Multi-Agent Network
    path('agents/', AgentNetworkView.as_view(), name='agent_network'),
    path('agents/<str:agent_id>/dispatch/', AgentTaskDispatchView.as_view(), name='agent_dispatch'),

    # L16 & L17: Real-Time Decision Intelligence
    path('decisions/', RealTimeDecisionStreamView.as_view(), name='realtime_decisions'),
    path('decisions/<uuid:decision_id>/action/', RealTimeDecisionActionView.as_view(), name='realtime_decision_action'),

    # L18: Autonomous Business Process Orchestration
    path('workflows/', AutonomousWorkflowView.as_view(), name='autonomous_workflows'),
    path('workflows/<uuid:workflow_id>/action/', AutonomousWorkflowActionView.as_view(), name='autonomous_workflow_action'),

    # L20: Controlled Self-Optimizing Platform
    path('optimizations/', SelfOptimizingPlatformView.as_view(), name='self_optimizing_platform'),

    # L21: Self-Healing Infrastructure
    path('resilience/self-heal/', SelfHealingResilienceView.as_view(), name='self_healing_resilience'),

    # L22: AI Agent Governance Platform
    path('governance/agents/', AgentGovernancePlatformView.as_view(), name='agent_governance_platform'),

    # L23: Enterprise Knowledge Graph
    path('knowledge-graph/', EnterpriseKnowledgeGraphView.as_view(), name='enterprise_knowledge_graph'),

    # L24: Cross-Channel Intelligence
    path('cross-channel/', CrossChannelIntelligenceView.as_view(), name='cross_channel_intelligence'),

    # L16 & L25: Autonomous Commerce Operating System & AI Context Engine
    path('ecosystem/overview/', AutonomousCommerceOSOverviewView.as_view(), name='autonomous_ecosystem_overview'),
    path('ecosystem/context-engine/', AIContextEngineQueryView.as_view(), name='ai_context_engine_query'),
    path('ecosystem/ranked-search/', AdvancedSearchRankingView.as_view(), name='advanced_ranked_search'),

    # L26: Context-Aware Commerce
    path('context/', ContextAwareCommerceView.as_view(), name='context_aware_commerce'),
    path('context/catalog/', ContextualCatalogView.as_view(), name='contextual_catalog'),

    # L27: Commerce Data Fabric
    path('data-fabric/', CommerceDataFabricView.as_view(), name='commerce_data_fabric'),
    path('data-fabric/scan/', DataQualityScanView.as_view(), name='data_quality_scan'),

    # L28: AI Model Operations (ModelOps)
    path('model-ops/', ModelOperationsView.as_view(), name='model_operations'),
    path('model-ops/rollback/', ModelRollbackView.as_view(), name='model_rollback'),

    # L29: Autonomous Business Intelligence
    path('autonomous-bi/', AutonomousBIView.as_view(), name='autonomous_bi'),
    path('autonomous-bi/query/', AutonomousBINLQueryView.as_view(), name='autonomous_bi_nl_query'),

    # L30: Next-Gen Commerce Operating Platform (Master Kernel)
    path('operating-platform/', CommerceOperatingPlatformView.as_view(), name='commerce_operating_platform'),
    path('operating-platform/dr-snapshot/', DisasterRecoverySnapshotView.as_view(), name='disaster_recovery_snapshot'),

    # Real-Data Enterprise Dashboard & Live Operations
    path('dashboard/summary/', EnterpriseDashboardSummaryView.as_view(), name='enterprise_dashboard_summary'),
    path('dashboard/analytics/', EnterpriseDashboardAnalyticsView.as_view(), name='enterprise_dashboard_analytics'),
    path('dashboard/ai-insights/', EnterpriseDashboardAIInsightsView.as_view(), name='enterprise_dashboard_ai_insights'),
    path('dashboard/security/', EnterpriseDashboardAuditSecurityView.as_view(), name='enterprise_dashboard_security'),
    path('dashboard/ai-assistant/', EnterpriseDashboardAIAssistantView.as_view(), name='enterprise_dashboard_ai_assistant'),
]
