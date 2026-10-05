import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { Button } from '../components/common/Button';
import { productService } from '../services/productService';
import api from '../services/api';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('RESTOCK');
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    productService.getProducts().then((res) => setProducts(res.results || res));
    api.get('/inventory/logs/').then((res) => setLogs(res.data.results || res.data)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantityChange) return;
    setLoading(true);
    try {
      await api.post('/inventory/adjust/', {
        product_id: Number(selectedProduct),
        quantity_change: Number(quantityChange),
        reason,
      });
      setQuantityChange('');
      loadData();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  };

  const productColumns = [
    { header: 'Product', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    {
      header: 'Available Stock',
      render: (row) => (
        <span style={{ color: row.stock < 5 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
          {row.stock} {row.stock < 5 && '(Low Stock Alert)'}
        </span>
      ),
    },
  ];

  const logColumns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Adjustment', render: (row) => <span style={{ color: row.change_amount > 0 ? '#10b981' : '#ef4444' }}>{row.change_amount > 0 ? `+${row.change_amount}` : row.change_amount}</span> },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Resulting Stock', accessor: 'resulting_stock' },
    { header: 'Timestamp', render: (row) => new Date(row.logged_at).toLocaleString() },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Warehouse Inventory</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stock levels, restocking controls & audit logs</span>
        </div>

        {/* Stock Adjustment Form */}
        <form onSubmit={handleAdjust} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Select Product</label>
            <select required value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}>
              <option value="">Choose product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Quantity Change (+/-)</label>
            <input type="number" required value={quantityChange} onChange={(e) => setQuantityChange(e.target.value)} placeholder="e.g. 25 or -5" style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}>
              <option value="RESTOCK">Warehouse Restock</option>
              <option value="MANUAL_ADJUSTMENT">Inventory Audit Adjustment</option>
              <option value="DAMAGED">Damaged Goods Write-off</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="md" loading={loading}>
            Apply Adjustment
          </Button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1rem' }}>Stock Levels</h3>
            <DataTable columns={productColumns} data={products} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1rem' }}>Audit Trail Logs</h3>
            <DataTable columns={logColumns} data={logs} />
          </div>
        </div>
      </main>
    </div>
  );
};
