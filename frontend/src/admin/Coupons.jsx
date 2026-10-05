import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { Button } from '../components/common/Button';
import api from '../services/api';
import { Plus } from 'lucide-react';

export const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [minOrderValue, setMinOrderValue] = useState('50');
  const [loading, setLoading] = useState(false);

  const loadCoupons = () => {
    api.get('/coupons/').then((res) => setCoupons(res.data.results || res.data)).catch(console.error);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/coupons/', {
        code: code.trim().toUpperCase(),
        discount_percentage: Number(discountPercentage),
        min_order_value: Number(minOrderValue),
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setCode('');
      loadCoupons();
    } catch (e) {
      alert('Failed to create coupon.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Promo Code', accessor: 'code' },
    { header: 'Discount', render: (row) => `${row.discount_percentage}% OFF` },
    { header: 'Min Order', render: (row) => `$${row.min_order_value}` },
    { header: 'Times Used', accessor: 'times_used' },
    { header: 'Status', render: (row) => <span style={{ color: row.is_active ? '#10b981' : '#ef4444' }}>{row.is_active ? 'Active' : 'Disabled'}</span> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Coupons & Promotions</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Create discount codes and manage campaigns</span>
        </div>

        <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Promo Code</label>
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. FLASH20" style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>
          <div style={{ width: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Discount %</label>
            <input type="number" required value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>
          <div style={{ width: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Min Order ($)</label>
            <input type="number" required value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            <Plus size={16} /> Create Code
          </Button>
        </form>

        <DataTable columns={columns} data={coupons} />
      </main>
    </div>
  );
};
