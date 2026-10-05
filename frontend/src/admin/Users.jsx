import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import api from '../services/api';

export const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', email: 'admin@smartcart.com', first_name: 'Admin', last_name: 'User', is_staff: true, date_joined: '2026-01-01' },
    { id: 2, username: 'janedoe', email: 'jane@example.com', first_name: 'Jane', last_name: 'Doe', is_staff: false, date_joined: '2026-02-14' },
    { id: 3, username: 'alexsmith', email: 'alex@example.com', first_name: 'Alex', last_name: 'Smith', is_staff: false, date_joined: '2026-03-01' },
  ]);

  useEffect(() => {
    api.get('/users/')
      .then((res) => {
        const data = res.data.results || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(() => {});
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Username', accessor: 'username' },
    { header: 'Full Name', render: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A' },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Role',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: row.is_staff ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: row.is_staff ? 'var(--primary-300)' : 'var(--text-main)',
          }}
        >
          {row.is_staff ? 'Staff Admin' : 'Customer'}
        </span>
      ),
    },
    { header: 'Joined', accessor: 'date_joined' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Users Management</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registered accounts and role privileges</span>
        </div>

        <DataTable columns={columns} data={users} />
      </main>
    </div>
  );
};
