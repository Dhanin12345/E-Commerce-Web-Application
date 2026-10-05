import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { Button } from '../components/common/Button';
import api from '../services/api';
import { Plus } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategories = () => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data)).catch(console.error);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post('/categories/', { name, description });
      setName('');
      setDescription('');
      loadCategories();
    } catch (e) {
      alert('Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Category Name', accessor: 'name' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Description', accessor: 'description' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Categories Taxonomy</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage store product classification categories</span>
        </div>

        <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Category Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart Wearables" style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>
          <div style={{ flex: 2, minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary..." style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            <Plus size={16} /> Add Category
          </Button>
        </form>

        <DataTable columns={columns} data={categories} />
      </main>
    </div>
  );
};
