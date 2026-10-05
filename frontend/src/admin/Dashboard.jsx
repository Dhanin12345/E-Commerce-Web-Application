import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { StatsCard } from '../components/admin/StatsCard';
import { SalesChart } from '../components/admin/SalesChart';
import { DataTable } from '../components/admin/DataTable';
import { OrderStatus } from '../components/orders/OrderStatus';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Store,
  RotateCcw,
  Headphones,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Check,
  Activity,
  Truck,
  Radio,
} from 'lucide-react';
import nextgenService from '../services/nextgenService';

export const Dashboard = () => {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('monthly');
  const [kpis, setKpis] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    average_order_value: 0,
    conversion_rate_pct: 3.5,
    total_refunds: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Feature 8: Forecasting
  const [forecasts, setForecasts] = useState([]);

  // Feature 9: Dynamic Pricing
  const [pricingRules, setPricingRules] = useState([]);
  const [applyingRules, setApplyingRules] = useState(false);

  // Feature 10: Risk Monitoring
  const [riskOrders, setRiskOrders] = useState([]);

  // Feature 11: Marketplace Sellers
  const [sellers, setSellers] = useState([]);

  // Feature 16: Returns Moderation
  const [returns, setReturns] = useState([]);

  // Feature 23: Support Tickets
  const [tickets, setTickets] = useState([]);

  // Feature 30: Security Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Next-Gen Modular Extensions States
  const [systemHealth, setSystemHealth] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [qualityProducts, setQualityProducts] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [poMessage, setPoMessage] = useState('');

  useEffect(() => {
    // 1. Fetch KPIs
    api.get(`/analytics/dashboard/?period=${period}`).then((res) => setKpis(res.data)).catch(console.error);
    api.get('/orders/').then((res) => setRecentOrders((res.data.results || res.data).slice(0, 5))).catch(console.error);

    // 2. Load tab-specific data on tab change
    if (activeTab === 'forecasting') {
      api.get('/inventory/forecasting/').then((res) => setForecasts(res.data)).catch(console.error);
    } else if (activeTab === 'pricing') {
      api.get('/inventory/dynamic-pricing/').then((res) => setPricingRules(res.data.results || res.data)).catch(console.error);
    } else if (activeTab === 'risk') {
      api.get('/analytics/risk-orders/').then((res) => setRiskOrders(res.data)).catch(console.error);
    } else if (activeTab === 'marketplace') {
      api.get('/marketplace/admin/sellers/').then((res) => setSellers(res.data.results || res.data)).catch(console.error);
    } else if (activeTab === 'returns') {
      api.get('/orders/returns/list/').then((res) => setReturns(res.data.results || res.data)).catch(console.error);
    } else if (activeTab === 'support') {
      api.get('/support/tickets/').then((res) => setTickets(res.data.results || res.data)).catch(console.error);
    } else if (activeTab === 'security') {
      api.get('/users/audit-logs/').then((res) => setAuditLogs(res.data.results || res.data)).catch(console.error);
    } else if (activeTab === 'system_health') {
      nextgenService.getSystemHealth().then(setSystemHealth).catch(console.error);
    } else if (activeTab === 'lifecycle') {
      nextgenService.getCustomerLifecycle().then(setLifecycle).catch(console.error);
    } else if (activeTab === 'suppliers') {
      nextgenService.getSuppliers().then(setSuppliers).catch(console.error);
      nextgenService.getPurchaseOrders().then(setPurchaseOrders).catch(console.error);
    } else if (activeTab === 'quality') {
      nextgenService.getQualityMonitoring().then((res) => setQualityProducts(res.products || [])).catch(console.error);
    } else if (activeTab === 'live_stream') {
      nextgenService.getAdminEvents().then((res) => setAdminEvents(res.events || [])).catch(console.error);
    }
  }, [activeTab, period]);

  const handleApplyPricingRules = async () => {
    try {
      setApplyingRules(true);
      const res = await api.post('/inventory/dynamic-pricing/apply/');
      alert(res.data.detail);
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingRules(false);
    }
  };

  const handleModerateReturn = async (id, action) => {
    try {
      await api.post(`/orders/returns/${id}/moderate/`, { action });
      const res = await api.get('/orders/returns/list/');
      setReturns(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateSeller = async (id, action) => {
    try {
      await api.post(`/marketplace/admin/sellers/${id}/moderate/`, { action });
      const res = await api.get('/marketplace/admin/sellers/');
      setSellers(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowX: 'hidden' }}>
        {/* Header with Title and Control Center Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Advanced Admin Control Center
            </h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Unified operational hub: Forecasting, Dynamic Pricing, Risk Engine & Marketplaces
            </span>
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    background: period === p ? 'var(--primary-600)' : 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Navigation Pill Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.75rem',
          }}
        >
          {[
            { key: 'overview', label: 'Overview & KPIs', icon: <TrendingUp size={16} /> },
            { key: 'system_health', label: 'System Health (Observability)', icon: <Activity size={16} /> },
            { key: 'lifecycle', label: 'Customer Lifecycle', icon: <Users size={16} /> },
            { key: 'suppliers', label: 'Suppliers & POs', icon: <Truck size={16} /> },
            { key: 'quality', label: 'Product Quality', icon: <CheckCircle size={16} /> },
            { key: 'live_stream', label: 'Live Events', icon: <Radio size={16} /> },
            { key: 'forecasting', label: 'Forecasting', icon: <Zap size={16} /> },
            { key: 'pricing', label: 'Pricing', icon: <DollarSign size={16} /> },
            { key: 'risk', label: 'Risk', icon: <ShieldAlert size={16} /> },
            { key: 'marketplace', label: 'Marketplaces', icon: <Store size={16} /> },
            { key: 'returns', label: 'Returns', icon: <RotateCcw size={16} /> },
            { key: 'support', label: 'Tickets', icon: <Headphones size={16} /> },
            { key: 'security', label: 'Audit Logs', icon: <FileCheck size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === tab.key ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.key ? '#ffffff' : 'var(--text-muted)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME ANALYTICS */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <StatsCard title="Total Revenue" value={formatPrice(kpis.total_revenue)} icon={<DollarSign size={24} />} change="14.2%" />
              <StatsCard title="Total Orders" value={kpis.total_orders} icon={<ShoppingCart size={24} />} change="8.5%" />
              <StatsCard title="Average Order Value" value={formatPrice(kpis.average_order_value)} icon={<TrendingUp size={24} />} change="AOV" />
              <StatsCard title="Store Conversion" value={`${kpis.conversion_rate_pct}%`} icon={<Zap size={24} />} change="High" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              <SalesChart />
              <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Recent Orders Feed</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          #{o.order_number}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--primary-400)' }}>
                          {formatPrice(o.total_amount)}
                        </div>
                        <OrderStatus status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SMART INVENTORY FORECASTING */}
        {activeTab === 'forecasting' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Demand Forecasting & Stock Depletion Predictions</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ML-driven 30-day velocity projections, safety buffer calculations, and automated reorder alerts
                </p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Product Name</th>
                  <th style={{ padding: '0.75rem' }}>Current Stock</th>
                  <th style={{ padding: '0.75rem' }}>Daily Velocity</th>
                  <th style={{ padding: '0.75rem' }}>Predicted 30D Demand</th>
                  <th style={{ padding: '0.75rem' }}>Recommended Reorder</th>
                  <th style={{ padding: '0.75rem' }}>Risk Status</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.product_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      {f.name} <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>({f.sku})</span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700' }}>{f.current_stock}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>{f.avg_daily_sales} / day</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--primary-300)', fontWeight: '600' }}>{f.predicted_30d_demand} units</td>
                    <td style={{ padding: '1rem 0.75rem', color: f.recommended_reorder > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: '700' }}>
                      {f.recommended_reorder > 0 ? `+${f.recommended_reorder} units` : 'Adequate'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            f.risk_level === 'OUT_OF_STOCK'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : f.risk_level === 'LOW_STOCK_WARNING'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            f.risk_level === 'OUT_OF_STOCK'
                              ? '#ef4444'
                              : f.risk_level === 'LOW_STOCK_WARNING'
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      >
                        {f.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: DYNAMIC PRICING ENGINE */}
        {activeTab === 'pricing' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Dynamic Pricing Strategy Rules</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Automate clearance discounts for excess stock and scarcity surge protection for rare items
                </p>
              </div>

              <button
                onClick={handleApplyPricingRules}
                disabled={applyingRules}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
              >
                <Play size={16} />
                {applyingRules ? 'Applying Rules...' : 'Execute Dynamic Price Recalculation'}
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Rule Name</th>
                  <th style={{ padding: '0.75rem' }}>Strategy Type</th>
                  <th style={{ padding: '0.75rem' }}>Stock Trigger Range</th>
                  <th style={{ padding: '0.75rem' }}>Price Adjustment</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pricingRules.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>{r.name}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--primary-300)' }}>{r.rule_type}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>{r.min_stock_threshold} - {r.max_stock_threshold} units</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: parseFloat(r.price_adjustment_pct) < 0 ? '#10b981' : '#f59e0b' }}>
                      {parseFloat(r.price_adjustment_pct) > 0 ? `+${r.price_adjustment_pct}%` : `${r.price_adjustment_pct}%`}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: r.is_active ? 'var(--success-500)' : 'var(--text-muted)' }}>
                        ● {r.is_active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: RISK & FRAUD MONITORING */}
        {activeTab === 'risk' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Order Risk & Fraud Telemetry
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Real-time heuristic evaluation monitoring checkout amounts, transaction velocity, and suspicious patterns
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Order #</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem' }}>Risk Score</th>
                  <th style={{ padding: '0.75rem' }}>Risk Level</th>
                  <th style={{ padding: '0.75rem' }}>Detection Factors</th>
                </tr>
              </thead>
              <tbody>
                {riskOrders.map((ro, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      #{ro.order_number}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>@{ro.customer}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700' }}>{formatPrice(ro.amount)}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '800' }}>{ro.risk_score} / 100</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            ro.risk_level === 'HIGH'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : ro.risk_level === 'MEDIUM'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            ro.risk_level === 'HIGH'
                              ? '#ef4444'
                              : ro.risk_level === 'MEDIUM'
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      >
                        {ro.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {ro.risk_factors.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: MULTI-SELLER MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Marketplace Sellers & Commission Registry
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Review merchant applications, approve storefronts, and tune platform commission shares
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Store Name</th>
                  <th style={{ padding: '0.75rem' }}>Merchant User</th>
                  <th style={{ padding: '0.75rem' }}>Commission %</th>
                  <th style={{ padding: '0.75rem' }}>Gross Sales</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {s.store_name}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>@{s.username}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: 'var(--primary-300)' }}>
                      {s.commission_pct}%
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '600' }}>{formatPrice(s.total_sales)}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: s.is_approved ? '#10b981' : '#f59e0b' }}>
                        ● {s.is_approved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      {!s.is_approved && (
                        <button
                          onClick={() => handleModerateSeller(s.id, 'APPROVE')}
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        >
                          Approve Store
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: RETURNS & REFUNDS MODERATION */}
        {activeTab === 'returns' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Order Returns & Refund Management
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Moderate customer return claims and process automated payment refunds
            </p>

            {returns.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No return claims submitted.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Order #</th>
                    <th style={{ padding: '0.75rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem' }}>Refund Amount</th>
                    <th style={{ padding: '0.75rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        #{r.order_number}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>@{r.user_name}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: 'var(--primary-400)' }}>
                        {formatPrice(r.refund_amount)}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', maxWidth: '240px', fontSize: '0.85rem' }}>{r.reason}</td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: r.status === 'REFUNDED' ? '#10b981' : '#f59e0b' }}>
                          ● {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        {r.status === 'REQUESTED' && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleModerateReturn(r.id, 'APPROVE')}
                              className="btn btn-primary"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            >
                              Approve & Refund
                            </button>
                            <button
                              onClick={() => handleModerateReturn(r.id, 'REJECT')}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 7: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Customer Support Help Desk Queue
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Manage customer queries, complaints, and warranty correspondence
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Subject</th>
                  <th style={{ padding: '0.75rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary-400)' }}>
                      {t.ticket_number}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>@{t.user_name}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>{t.category}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>{t.subject}</td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '700', color: t.priority === 'HIGH' ? '#ef4444' : '#f59e0b' }}>
                      {t.priority}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: t.status === 'RESOLVED' ? '#10b981' : '#f59e0b' }}>
                        ● {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 8: SECURITY AUDIT LOGS */}
        {activeTab === 'security' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Security & Audit Event Trail
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Immutable audit log of staff logins, permission elevation, and critical API actions
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                  <th style={{ padding: '0.75rem' }}>Resource URI</th>
                  <th style={{ padding: '0.75rem' }}>Client IP</th>
                  <th style={{ padding: '0.75rem' }}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      @{log.username || 'System'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontFamily: 'monospace', color: 'var(--primary-300)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>{log.resource}</td>
                    <td style={{ padding: '1rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip_address}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: log.result === 'SUCCESS' ? '#10b981' : '#ef4444' }}>
                        ● {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Next-Gen Feature 34: System Health Observability Dashboard */}
        {activeTab === 'system_health' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#10b981" /> Architectural Subsystems & Observability
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Live heartbeat metrics, response latencies, and service availability.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#10b981', color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px' }}>
                  STATUS: {systemHealth?.overall_status || 'ONLINE'}
                </span>
                <button
                  onClick={() => nextgenService.getSystemHealth().then(setSystemHealth)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  🔄 Ping Subsystems
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {systemHealth && systemHealth.services && Object.entries(systemHealth.services).map(([name, svc]) => (
                <div
                  key={name}
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize', color: 'var(--text-main)' }}>
                      {name.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                      background: svc.status === 'ONLINE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: svc.status === 'ONLINE' ? '#10b981' : '#ef4444'
                    }}>
                      ● {svc.status}
                    </span>
                  </div>
                  {svc.latency_ms !== undefined && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Latency: <b style={{ color: 'var(--accent-400)' }}>{svc.latency_ms} ms</b>
                    </div>
                  )}
                  {svc.engine && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Engine: {svc.engine}</div>
                  )}
                  {svc.provider && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adapter: {svc.provider}</div>
                  )}
                  {svc.model && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model: {svc.model}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next-Gen Feature 7: Customer Lifecycle Engine */}
        {activeTab === 'lifecycle' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary-400)" /> Customer Behavioral Lifecycle Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Dynamic segmentation of customer base using purchase frequency, recency, and account maturity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {lifecycle && lifecycle.segments && Object.entries(lifecycle.segments).map(([segment, data]) => (
                <div
                  key={segment}
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '1.25rem'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {segment} Customers
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-400)', margin: '4px 0' }}>
                    {data.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({data.pct}%)</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {data.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next-Gen Feature 9 & 10: Supplier Management & Purchase Orders */}
        {activeTab === 'suppliers' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={20} color="var(--accent-400)" /> Supplier Partners & Automated Restocking POs
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Monitor vendor lead times and receive incoming shipments into inventory with 1 click.
                </span>
              </div>
            </div>

            {poMessage && (
              <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
                ✅ {poMessage}
              </div>
            )}

            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Active Purchase Orders</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>PO Number</th>
                  <th style={{ padding: '0.75rem' }}>Supplier</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Total Cost</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-300)' }}>
                      {po.po_number}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-main)' }}>{po.supplier_name}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                        background: po.status === 'RECEIVED' ? '#dcfce7' : '#fef3c7',
                        color: po.status === 'RECEIVED' ? '#15803d' : '#92400e'
                      }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                      {po.items?.map((i) => `${i.product_name} (x${i.quantity})`).join(', ') || 'General restock'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ${po.total_cost || '0.00'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      {po.status !== 'RECEIVED' ? (
                        <button
                          onClick={async () => {
                            try {
                              const res = await nextgenService.receivePurchaseOrder(po.id);
                              setPoMessage(res.message);
                              nextgenService.getPurchaseOrders().then(setPurchaseOrders);
                            } catch (e) {
                              alert('Error receiving purchase order');
                            }
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                        >
                          📦 Receive & Restock
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Stock Updated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Supplier Directory</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {suppliers.map((s) => (
                <div key={s.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Code: {s.code} &bull; Email: {s.contact_email}</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '8px', fontSize: '0.8rem' }}>
                    <span>Lead Time: <b>{s.lead_time_days} days</b></span>
                    <span>MOQ: <b>{s.moq} units</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next-Gen Feature 13: Product Quality Monitoring */}
        {activeTab === 'quality' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#10b981" /> Smart Product Quality Monitoring
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Monitors ratings, negative review signals, return frequency, and inventory stability to flag items needing attention.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Product</th>
                  <th style={{ padding: '0.75rem' }}>Avg Rating</th>
                  <th style={{ padding: '0.75rem' }}>Reviews</th>
                  <th style={{ padding: '0.75rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {qualityProducts.map((p) => (
                  <tr key={p.product_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.product_name}</td>
                    <td style={{ padding: '1rem 0.75rem', color: '#f59e0b', fontWeight: 700 }}>★ {p.rating.toFixed(1)}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>{p.reviews_count}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-main)' }}>{p.current_stock}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                        background: p.status === 'NORMAL' ? '#dcfce7' : (p.status === 'MONITOR' ? '#fef3c7' : '#fee2e2'),
                        color: p.status === 'NORMAL' ? '#15803d' : (p.status === 'MONITOR' ? '#a16207' : '#b91c1c')
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {p.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Next-Gen Feature 28: Real-Time Collaborative Admin Event Stream */}
        {activeTab === 'live_stream' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={20} color="#ec4899" /> Real-Time Collaborative Event Stream
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Live operational updates for simultaneous administrator collaboration.
                </span>
              </div>
              <button
                onClick={() => nextgenService.getAdminEvents().then((res) => setAdminEvents(res.events || []))}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                🔄 Refresh Stream
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {adminEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Listening for real-time application events...
                </div>
              ) : (
                adminEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: '10px', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-300)' }}>
                        {evt.event_type}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                        Payload: {JSON.stringify(evt.payload)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
