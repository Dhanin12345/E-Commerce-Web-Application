import React, { useState } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { Button } from '../components/common/Button';

export const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'SmartCart E-Commerce',
    supportEmail: 'support@smartcart.com',
    currency: 'USD',
    taxRate: '8.25',
    freeShippingThreshold: '100',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Store Configuration</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Global store metadata, currency, and operational thresholds</span>
        </div>

        {saved && (
          <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-500)', color: '#10b981', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            Store preferences saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Store Name</label>
            <input type="text" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Customer Support Email</label>
            <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Currency</label>
              <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Estimated Tax %</label>
              <input type="number" step="0.01" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Free Shipping ($)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
            Save Preferences
          </Button>
        </form>
      </main>
    </div>
  );
};
