import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { SalesChart } from '../components/admin/SalesChart';
import { DataTable } from '../components/admin/DataTable';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../services/api';

export const Analytics = () => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    api.get('/analytics/top-products/').then((res) => setTopProducts(res.data)).catch(console.error);
  }, []);

  const columns = [
    { header: 'Product Name', accessor: 'product_name' },
    { header: 'Total Units Sold', accessor: 'total_sold' },
    { header: 'Gross Revenue', render: (row) => formatCurrency(row.revenue) },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Business Intelligence</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Revenue velocity and merchandise conversion reports</span>
        </div>

        <SalesChart />

        <div>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1rem' }}>Top Selling Products</h3>
          <DataTable columns={columns} data={topProducts} emptyMessage="No sales volume recorded yet." />
        </div>
      </main>
    </div>
  );
};
