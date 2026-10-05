import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/admin/Sidebar';
import { Button } from '../components/common/Button';
import { productService } from '../services/productService';
import { ArrowLeft } from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    sku: '',
    description: '',
    price: '',
    discount_price: '',
    stock: 10,
    is_active: true,
  });

  useEffect(() => {
    productService.getCategories().then((data) => setCategories(data.results || data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productService.createProduct(form);
      navigate('/admin/products');
    } catch (e) {
      alert('Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '800px' }}>
        <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '1.5rem' }}>Add New Product</h1>

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Product Name *</label>
            <input type="text" required name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>SKU Code *</label>
              <input type="text" required name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. AURA-001" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Price ($) *</label>
              <input type="number" step="0.01" required name="price" value={form.price} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Discount Price ($)</label>
              <input type="number" step="0.01" name="discount_price" value={form.discount_price} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Initial Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Description</label>
            <textarea rows={4} required name="description" value={form.description} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
            Save Product
          </Button>
        </form>
      </main>
    </div>
  );
};
