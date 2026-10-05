import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { Rating } from '../components/product/Rating';
import api from '../services/api';

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/reviews/').then((res) => setReviews(res.data.results || res.data)).catch(console.error);
  }, []);

  const columns = [
    { header: 'Product ID', accessor: 'product' },
    { header: 'Customer', accessor: 'username' },
    { header: 'Rating', render: (row) => <Rating value={row.rating} size={14} /> },
    { header: 'Feedback Comment', accessor: 'comment' },
    { header: 'Submitted', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Customer Reviews</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Moderate customer ratings and product testimonials</span>
        </div>

        <DataTable columns={columns} data={reviews} emptyMessage="No customer reviews submitted yet." />
      </main>
    </div>
  );
};
