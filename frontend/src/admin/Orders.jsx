import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { OrderStatus } from '../components/orders/OrderStatus';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../services/api';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data.results || data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await api.patch(`/orders/${orderNumber}/`, { status: newStatus });
      loadOrders();
    } catch (e) {
      alert('Failed to update order status.');
    }
  };

  const columns = [
    { header: 'Order ID', accessor: 'order_number' },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { header: 'Status', render: (row) => <OrderStatus status={row.status} /> },
    { header: 'Items', render: (row) => `${row.items?.length || 0} items` },
    { header: 'Total', render: (row) => formatCurrency(row.total_amount) },
    {
      header: 'Update Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.order_number, e.target.value)}
          style={{
            padding: '0.35rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: '0.8rem',
          }}
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Orders Management</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fulfill orders and track customer shipments</span>
        </div>

        <DataTable columns={columns} data={orders} />
      </main>
    </div>
  );
};
