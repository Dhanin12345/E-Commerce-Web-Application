import api from './api';

const nextgenService = {
  // 1. AI Shopping Copilot
  copilotChat: async (query) => {
    const res = await api.post('/nextgen/copilot/', { query });
    return res.data;
  },

  // 2. Visual Search
  visualSearch: async (fileOrFormData) => {
    let payload = fileOrFormData;
    let headers = {};
    if (fileOrFormData instanceof File) {
      payload = new FormData();
      payload.append('image', fileOrFormData);
      headers['Content-Type'] = 'multipart/form-data';
    }
    const res = await api.post('/nextgen/visual-search/', payload, { headers });
    return res.data;
  },

  // 4. Smart Bundles
  getBundles: async () => {
    const res = await api.get('/nextgen/bundles/');
    return res.data.results || res.data;
  },
  addBundleToCart: async (bundleId) => {
    const res = await api.post(`/nextgen/bundles/${bundleId}/add_to_cart/`);
    return res.data;
  },

  // 5. Smart Cart Optimization
  getCartOptimization: async () => {
    const res = await api.get('/nextgen/cart/optimize/');
    return res.data;
  },

  // 7. Customer Lifecycle
  getCustomerLifecycle: async () => {
    const res = await api.get('/nextgen/customer-lifecycle/');
    return res.data;
  },

  // 8. Inventory Automation
  getInventoryAutomation: async () => {
    const res = await api.get('/nextgen/inventory/automation/');
    return res.data;
  },

  // 9 & 10. Suppliers & Purchase Orders
  getSuppliers: async () => {
    const res = await api.get('/nextgen/suppliers/');
    return res.data.results || res.data;
  },
  getPurchaseOrders: async () => {
    const res = await api.get('/nextgen/purchase-orders/');
    return res.data.results || res.data;
  },
  receivePurchaseOrder: async (id) => {
    const res = await api.post(`/nextgen/purchase-orders/${id}/receive/`);
    return res.data;
  },

  // 11. Returns Analytics
  getReturnsAnalytics: async () => {
    const res = await api.get('/nextgen/returns-analytics/');
    return res.data;
  },

  // 12. Review Insights
  getReviewInsights: async (productId) => {
    const url = productId ? `/nextgen/reviews/insights/?product_id=${productId}` : '/nextgen/reviews/insights/';
    const res = await api.get(url);
    return res.data;
  },

  // 13. Quality Monitoring
  getQualityMonitoring: async () => {
    const res = await api.get('/nextgen/quality-monitoring/');
    return res.data;
  },

  // 16. Collections
  getCollections: async () => {
    const res = await api.get('/nextgen/collections/');
    return res.data.results || res.data;
  },
  getCollectionByToken: async (token) => {
    const res = await api.get(`/nextgen/collections/by-token/${token}/`);
    return res.data;
  },

  // 18. Subscriptions
  getSubscriptions: async () => {
    const res = await api.get('/nextgen/subscriptions/');
    return res.data.results || res.data;
  },
  createSubscription: async (productId, interval = 'MONTHLY') => {
    const res = await api.post('/nextgen/subscriptions/', { product: productId, billing_interval: interval });
    return res.data;
  },
  pauseSubscription: async (id) => {
    const res = await api.post(`/nextgen/subscriptions/${id}/pause/`);
    return res.data;
  },
  resumeSubscription: async (id) => {
    const res = await api.post(`/nextgen/subscriptions/${id}/resume/`);
    return res.data;
  },
  cancelSubscription: async (id) => {
    const res = await api.post(`/nextgen/subscriptions/${id}/cancel/`);
    return res.data;
  },

  // 20. Waitlist
  joinWaitlist: async (productId, email) => {
    const res = await api.post('/nextgen/waitlist/join/', { product_id: productId, email });
    return res.data;
  },

  // 21. Delivery Estimate
  getDeliveryEstimate: async (pincode, method = 'STANDARD') => {
    const res = await api.get(`/nextgen/delivery-estimate/?pincode=${pincode}&method=${method}`);
    return res.data;
  },

  // 25. Feature Flags
  getFeatureFlags: async () => {
    const res = await api.get('/nextgen/feature-flags/public/');
    return res.data;
  },

  // 28. Collaborative Admin Events
  getAdminEvents: async () => {
    const res = await api.get('/nextgen/events/stream/');
    return res.data;
  },

  // 29. Audit Logs
  getAuditLogs: async () => {
    const res = await api.get('/nextgen/audit-logs/');
    return res.data;
  },

  // 32. Privacy Center Preferences
  getPrivacyPreferences: async () => {
    const res = await api.get('/nextgen/privacy/preferences/');
    return res.data;
  },
  updatePrivacyPreferences: async (data) => {
    const res = await api.put('/nextgen/privacy/preferences/', data);
    return res.data;
  },

  // 33. Data Export
  exportUserData: (format = 'json') => {
    const token = localStorage.getItem('token');
    const url = `/api/nextgen/privacy/export/?format=${format}`;
    window.open(url, '_blank');
  },

  // 34. System Health Extended
  getSystemHealth: async () => {
    const res = await api.get('/nextgen/system-health/');
    return res.data;
  },
};

export default nextgenService;
