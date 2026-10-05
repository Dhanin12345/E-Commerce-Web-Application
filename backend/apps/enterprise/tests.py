from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from apps.products.models import Product
from apps.categories.models import Category
from apps.enterprise.models import Warehouse, WarehouseInventory, Wallet, FeatureFlag
from apps.enterprise.events.bus import DomainEventBus
from apps.enterprise.cqrs.commands import CommandHandler
from apps.enterprise.cqrs.queries import QueryHandler
from apps.enterprise.resilience.circuit_breaker import CircuitBreaker, CircuitBreakerOpenException
from apps.enterprise.services.warehouse_service import WarehouseService
from apps.enterprise.services.wallet_service import WalletService
from apps.enterprise.services.fraud_service import FraudRiskEngine
from apps.enterprise.ai.shopping_agent import AIShoppingAgent
from apps.enterprise.ai.vector_search import VectorSearchEngine

class EnterpriseArchitectureTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test_enterprise', password='password123')
        self.cat = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.cat,
            name='Zenith 4K Display Pro',
            slug='zenith-4k-pro',
            sku='ZEN-4K-01',
            price=Decimal('500.00'),
            discount_price=Decimal('450.00'),
            stock=25
        )
        self.warehouse = Warehouse.objects.create(
            name='Test Hub',
            code='WH-TEST-01',
            address='123 Tech Way',
            city='Bangalore',
            state='Karnataka',
            postal_code='560001'
        )
        WarehouseInventory.objects.create(
            warehouse=self.warehouse,
            product=self.product,
            quantity_on_hand=50,
            reserved_quantity=0
        )

    def test_domain_event_bus_publish(self):
        received_events = []
        def test_sub(payload, correlation_id=None):
            received_events.append(payload)

        DomainEventBus.subscribe('CustomTestEvent', test_sub)
        res = DomainEventBus.publish('CustomTestEvent', {'msg': 'Hello Enterprise'})
        self.assertEqual(res['status'], 'PROCESSED')
        self.assertEqual(len(received_events), 1)

    def test_cqrs_create_order_command(self):
        order_data = {
            "items": [{"product_id": self.product.id, "quantity": 1}],
            "shipping_address": "Test Street 101"
        }
        res = CommandHandler.handle_create_order(self.user, order_data)
        self.assertTrue(res['success'])
        self.assertEqual(res['status'], 'PENDING')
        self.assertEqual(res['total_amount'], 450.0)

    def test_warehouse_fulfillment_plan(self):
        plan = WarehouseService.find_optimal_fulfillment_plan([{"product_id": self.product.id, "quantity": 2}])
        self.assertTrue(plan['can_fulfill_all'])
        self.assertEqual(len(plan['shipments']), 1)
        self.assertEqual(plan['shipments'][0]['warehouse_code'], 'WH-TEST-01')

    def test_wallet_double_entry_ledger(self):
        wallet = WalletService.get_or_create_wallet(self.user)
        initial_bal = float(wallet.balance)
        
        # Credit transaction
        res = WalletService.process_transaction(self.user, 'CREDIT', 200.0, 'Promotional Bonus')
        self.assertEqual(res['balance_after'], initial_bal + 200.0)

        # Debit transaction
        res_debit = WalletService.process_transaction(self.user, 'DEBIT', 50.0, 'Order Purchase')
        self.assertEqual(res_debit['balance_after'], initial_bal + 150.0)

    def test_fraud_risk_evaluation(self):
        eval_res = FraudRiskEngine.evaluate_order('ORD-999', 1500.0, self.user, payment_attempts=4)
        self.assertEqual(eval_res['risk_level'], 'HIGH')
        self.assertEqual(eval_res['action_taken'], 'MANUAL_REVIEW')
        self.assertTrue(len(eval_res['contributing_factors']) >= 2)

    def test_circuit_breaker_resilience(self):
        breaker = CircuitBreaker("mock_service", failure_threshold=2, recovery_time_sec=5.0)

        def failing_func():
            raise ValueError("Upstream failure")

        def graceful_fallback():
            return "DEGRADED_FALLBACK"

        # Attempt 1 (Failure 1)
        res1 = breaker.call(failing_func, fallback=graceful_fallback)
        self.assertEqual(res1, "DEGRADED_FALLBACK")
        self.assertEqual(breaker.state, CircuitBreaker.STATE_CLOSED)

        # Attempt 2 (Failure 2 - Trips Breaker)
        res2 = breaker.call(failing_func, fallback=graceful_fallback)
        self.assertEqual(res2, "DEGRADED_FALLBACK")
        self.assertEqual(breaker.state, CircuitBreaker.STATE_OPEN)

        # Attempt 3 (Immediate fast-fail with fallback while OPEN)
        res3 = breaker.call(failing_func, fallback=graceful_fallback)
        self.assertEqual(res3, "DEGRADED_FALLBACK")

    def test_ai_shopping_agent_workflow(self):
        res = AIShoppingAgent.process_request("Find a 4K monitor under 600 dollars")
        self.assertEqual(res['step'], 'PROPOSAL_READY')
        self.assertTrue(res['requires_confirmation'])
        self.assertEqual(res['best_match']['id'], self.product.id)

    def test_vector_search_engine(self):
        results = VectorSearchEngine.hybrid_search("4K Display Pro", limit=5)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]['id'], self.product.id)

    def test_l11_demand_forecasting_and_inventory_prediction(self):
        from apps.enterprise.services.autonomous_intelligence import PredictionService
        forecast = PredictionService.forecast_demand(horizon_days=7)
        self.assertEqual(forecast['horizon_days'], 7)
        self.assertEqual(len(forecast['timeline']), 7)

        depletion = PredictionService.predict_inventory_exhaustion(product_id=self.product.id)
        self.assertTrue(len(depletion) > 0)
        self.assertEqual(depletion[0]['product_id'], self.product.id)
        self.assertTrue('days_until_exhaustion' in depletion[0])

    def test_l12_digital_twin_simulation_sandbox(self):
        from apps.enterprise.services.digital_twin import DigitalTwinSimulator
        from apps.enterprise.models import DigitalTwinSimulation
        sim = DigitalTwinSimulator.run_simulation('DEMAND_SPIKE', {'traffic_surge_pct': 40})
        self.assertEqual(sim['scenario_name'], 'DEMAND_SPIKE')
        self.assertTrue('projected_metrics' in sim)
        self.assertTrue('baseline_metrics' in sim)
        self.assertTrue(len(sim['recommendations']) > 0)
        # Ensure simulation was stored
        self.assertTrue(DigitalTwinSimulation.objects.filter(simulation_id=sim['simulation_id']).exists())

    def test_l13_multi_agent_network_dispatch(self):
        from apps.enterprise.services.agent_network import MultiAgentCommerceNetwork
        topology = MultiAgentCommerceNetwork.get_agent_topology()
        self.assertEqual(topology['agents_count'], 11)

        dispatch_res = MultiAgentCommerceNetwork.dispatch_task('inventory_agent', 'TriggerSafetyStockAudit')
        self.assertEqual(dispatch_res['status'], 'SUCCESS')
        self.assertTrue(len(dispatch_res['audit_hash']) > 0)

    def test_l14_smart_pricing_deterministic_audit(self):
        from apps.enterprise.services.smart_pricing_engine import SmartPricingEngine
        from apps.enterprise.models import PriceCalculationAudit
        res = SmartPricingEngine.calculate_price_with_audit(self.product.id, quantity=5, customer_segment='VIP')
        self.assertTrue(res['computed_unit_price'] < float(self.product.price))
        self.assertTrue(PriceCalculationAudit.objects.filter(audit_id=res['audit_id']).exists())

    def test_l14_decision_support_authorization_workflow(self):
        from apps.enterprise.services.autonomous_intelligence import DecisionSupportService
        insights = DecisionSupportService.generate_or_refresh_insights()
        self.assertTrue(insights.count() > 0)
        first_insight = insights.first()

        # Authorize and execute
        exec_res = DecisionSupportService.authorize_and_execute(first_insight.insight_id, user=self.user)
        self.assertEqual(exec_res['status'], 'EXECUTED')
        first_insight.refresh_from_db()
        self.assertEqual(first_insight.status, 'EXECUTED')

    def test_l16_l17_realtime_decision_stream_evaluation(self):
        from apps.enterprise.services.decision_intelligence import DecisionIntelligenceService
        from apps.enterprise.models import RealTimeDecision

        decision = DecisionIntelligenceService.evaluate_event('ORDER_CREATED', {
            'total_amount': 29500.0,
            'is_new_customer': True,
            'item_count': 3
        }, auto_authorize_low_risk=False)

        self.assertEqual(decision.decision_type, 'FRAUD')
        self.assertEqual(decision.authorization_status, 'PENDING')
        self.assertTrue(len(decision.rules_used) > 0)
        self.assertTrue(RealTimeDecision.objects.filter(decision_id=decision.decision_id).exists())

        # Authorize decision
        auth_res = DecisionIntelligenceService.authorize_decision(decision.decision_id, user=self.user, action='AUTHORIZE')
        self.assertEqual(auth_res['status'], 'AUTHORIZED')
        decision.refresh_from_db()
        self.assertEqual(decision.authorization_status, 'AUTHORIZED')

    def test_l18_autonomous_workflow_orchestration(self):
        from apps.enterprise.services.workflow_orchestrator import WorkflowOrchestrator
        from apps.enterprise.models import WorkflowInstance

        # Start fulfillment workflow
        wf = WorkflowOrchestrator.start_workflow('ORDER_FULFILLMENT', reference_id='ORD-TEST-101', user=self.user)
        self.assertEqual(wf.workflow_type, 'ORDER_FULFILLMENT')
        self.assertEqual(wf.status, 'COMPLETED')
        self.assertEqual(wf.steps.count(), 8)

        # Start reorder workflow with approval gate
        wf_reorder = WorkflowOrchestrator.start_workflow('INVENTORY_REORDER', reference_id='SKU-REORDER-TEST', user=self.user)
        self.assertEqual(wf_reorder.status, 'PENDING_APPROVAL')
        self.assertEqual(wf_reorder.current_step, 'OPERATOR_APPROVAL_GATE')

        # Approve reorder
        app_res = WorkflowOrchestrator.approve_workflow(wf_reorder.workflow_id, user=self.user)
        self.assertEqual(app_res['status'], 'APPROVED')

    def test_l20_self_optimizing_platform(self):
        from apps.enterprise.services.self_healing import SelfHealingOptimizationService
        from apps.enterprise.models import OptimizationRecommendation

        recs = SelfHealingOptimizationService.run_optimization_audit()
        self.assertTrue(len(recs) > 0)
        target_rec = recs[0]

        apply_res = SelfHealingOptimizationService.apply_optimization(target_rec.recommendation_id, user=self.user)
        self.assertEqual(apply_res['status'], 'APPLIED')
        target_rec.refresh_from_db()
        self.assertEqual(target_rec.status, 'APPLIED')

    def test_l21_self_healing_infrastructure(self):
        from apps.enterprise.services.self_healing import SelfHealingOptimizationService

        probe = SelfHealingOptimizationService.trigger_self_healing_probe()
        self.assertEqual(probe['resilience_level'], 'L21_SELF_HEALING_ACTIVE')
        self.assertTrue(len(probe['diagnostics']) >= 4)

    def test_l22_agent_governance_platform(self):
        from apps.enterprise.services.agent_governance import AgentGovernanceService

        AgentGovernanceService.sync_governance_registry()

        # Level 0 agent - allowed read action
        v1 = AgentGovernanceService.evaluate_governance_gate('CATALOG_NAVIGATOR', 'READ_PRODUCT', tools_used=['search_catalog'])
        self.assertEqual(v1['verdict'], 'PASSED')

        # Unauthorized tool usage -> BLOCKED
        v2 = AgentGovernanceService.evaluate_governance_gate('CATALOG_NAVIGATOR', 'READ_PRODUCT', tools_used=['execute_db_drop'])
        self.assertEqual(v2['verdict'], 'BLOCKED')

        # Level 3 agent (Price Optimizer) -> ESCALATED / AWAITING_APPROVAL
        v3 = AgentGovernanceService.evaluate_governance_gate('PRICE_OPTIMIZER', 'PROPOSE_PRICE_ADJUSTMENT', tools_used=['compute_elasticity'])
        self.assertEqual(v3['verdict'], 'AWAITING_APPROVAL')

    def test_l23_enterprise_knowledge_graph(self):
        from apps.enterprise.services.knowledge_graph import CommerceKnowledgeGraphService

        snapshot = CommerceKnowledgeGraphService.get_graph_snapshot()
        self.assertTrue(snapshot['total_nodes'] > 0)
        self.assertTrue(snapshot['total_links'] > 0)

        subgraph = CommerceKnowledgeGraphService.query_product_subgraph(self.product.id)
        self.assertEqual(subgraph['center_node'], f"P_{self.product.id}")
        self.assertTrue(len(subgraph['subgraph_nodes']) > 0)

    def test_l24_cross_channel_intelligence(self):
        from apps.enterprise.services.cross_channel import CrossChannelService

        CrossChannelService.record_interaction('SES-UNIT-01', 'WEB', 'SEARCH', {'query': 'Zenith 4K'}, user=self.user)
        CrossChannelService.record_interaction('SES-UNIT-01', 'MOBILE_APP', 'ADD_TO_CART', {'product_id': self.product.id}, user=self.user)

        journey = CrossChannelService.get_customer_journey(session_id='SES-UNIT-01')
        self.assertEqual(journey['total_touchpoints'], 2)
        metrics = CrossChannelService.get_cross_channel_metrics()
        self.assertEqual(metrics['omnichannel_readiness_level'], 'L24_ACTIVE')

    def test_l25_ai_context_engine_10_step_grounding(self):
        from apps.enterprise.services.autonomous_ecosystem import AutonomousCommerceEcosystem

        res = AutonomousCommerceEcosystem.execute_ai_context_pipeline('What is the price of Zenith 4K Display Pro?', user=self.user)
        self.assertEqual(len(res['pipeline_steps']), 10)
        self.assertEqual(res['intent'], 'INQUIRE_PRICE')
        self.assertEqual(res['factual_grounding']['product_found'], True)
        self.assertIn('500.00', res['response'])

    def test_l26_context_aware_commerce(self):
        from apps.enterprise.services.context_commerce import ContextAwareCommerceService

        profile = ContextAwareCommerceService.get_or_create_context(
            session_id='SES-TEST-L26',
            user=self.user,
            device_category='MOBILE',
            geo_region='US-WEST',
            weather='RAINY'
        )
        self.assertEqual(profile.device_category, 'MOBILE')
        self.assertEqual(profile.environmental_context['simulated_weather'], 'RAINY')

        updated = ContextAwareCommerceService.update_momentum_and_intent(
            session_id='SES-TEST-L26',
            interactions_count=5,
            time_spent_seconds=30.0,
            search_count=2,
            cart_actions=1
        )
        self.assertTrue(updated.momentum_score > 0.0)

        catalog_res = ContextAwareCommerceService.contextualize_product_catalog('SES-TEST-L26')
        self.assertEqual(catalog_res['session_id'], 'SES-TEST-L26')
        self.assertTrue(catalog_res['total_contextualized'] > 0)

    def test_l27_commerce_data_fabric(self):
        from apps.enterprise.services.data_fabric import CommerceDataFabricService

        rec = CommerceDataFabricService.record_cdc_mutation(
            source_entity='Product',
            entity_id=str(self.product.id),
            operation='UPDATE'
        )
        self.assertEqual(rec.status, 'SYNCED')
        self.assertEqual(rec.source_entity, 'Product')

        routing = CommerceDataFabricService.route_fabric_query('CATALOG_FILTER', 'Product')
        self.assertEqual(routing['routed_tier'], 'SEARCH_OPENSEARCH')

        report = CommerceDataFabricService.run_catalog_quality_scan()
        self.assertEqual(report.dataset_name, 'PRODUCTS_CATALOG')
        self.assertTrue(report.validity_score > 0.0)

    def test_l28_ai_model_operations(self):
        from apps.enterprise.services.model_ops import ModelOperationsService

        policies = ModelOperationsService.get_or_initialize_policies()
        self.assertTrue(len(policies) >= 3)

        route_info = ModelOperationsService.route_inference_traffic('smartcart-ranking-v4')
        self.assertIn(route_info['variant'], ['CHAMPION', 'CHALLENGER_CANARY'])

        eval_run = ModelOperationsService.record_evaluation_benchmark(
            model_name='smartcart-ranking-v4',
            version='v4.2.0-rc2',
            ndcg_score=0.912,
            factual_grounding_score=0.999,
            avg_latency_ms=42.0
        )
        self.assertTrue(eval_run.passed_quality_gate)

        rollback_res = ModelOperationsService.trigger_automated_rollback('smartcart-ranking-v4', reason='Latency Spike')
        self.assertEqual(rollback_res['status'], 'AUTO_ROLLED_BACK')

    def test_l29_autonomous_business_intelligence(self):
        from apps.enterprise.services.autonomous_bi import AutonomousBusinessIntelligenceService

        brief = AutonomousBusinessIntelligenceService.generate_executive_briefing('DAILY')
        self.assertEqual(brief.period, 'DAILY')
        self.assertIn('kpis', brief.__dict__ or {})
        self.assertTrue(len(brief.key_drivers) > 0)

        nl_res = AutonomousBusinessIntelligenceService.execute_nl_query('What is total platform revenue?')
        self.assertIn('Revenue', nl_res['data']['metric'])
        self.assertEqual(nl_res['confidence'], 0.99)

        goals = AutonomousBusinessIntelligenceService.get_or_initialize_goals()
        self.assertTrue(len(goals) >= 4)

    def test_l30_commerce_operating_platform(self):
        from apps.enterprise.services.commerce_operating_platform import CommerceOperatingPlatformService

        audits = CommerceOperatingPlatformService.audit_platform_slas()
        self.assertEqual(len(audits), 6)

        snapshot = CommerceOperatingPlatformService.generate_disaster_recovery_snapshot('SCHEDULED')
        self.assertEqual(snapshot.verification_status, 'VERIFIED_HEALTHY')
        self.assertEqual(len(snapshot.state_hash), 64)

        verify_res = CommerceOperatingPlatformService.verify_disaster_recovery_snapshot(str(snapshot.snapshot_id))
        self.assertTrue(verify_res['verified'])

        kernel_status = CommerceOperatingPlatformService.get_master_kernel_status()
        self.assertIn('Kernel v30.0-L30', kernel_status['platform_version'])
        self.assertEqual(kernel_status['overall_health'], 'HEALTHY')



