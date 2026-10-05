import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/admin/Sidebar';
import { DataTable } from '../components/admin/DataTable';
import { Button } from '../components/common/Button';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data.results || data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await productService.deleteProduct(id);
      await loadProducts();
    }
  };

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Category', render: (row) => row.category_details?.name || 'N/A' },
    { header: 'Price', render: (row) => formatCurrency(row.price) },
    { header: 'Stock', render: (row) => <span style={{ color: row.stock > 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>{row.stock}</span> },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/admin/products/edit/${row.id}`} style={{ padding: '0.3rem', color: 'var(--primary-400)' }}>
            <Edit2 size={16} />
          </Link>
          <button onClick={() => handleDelete(row.id)} style={{ background: 'transparent', color: 'var(--danger-500)', padding: '0.3rem' }}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Products Catalog</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage inventory products & prices</span>
          </div>
          <Link to="/admin/products/add">
            <Button variant="primary" size="md">
              <Plus size={16} /> Add Product
            </Button>
          </Link>
        </div>

        <DataTable columns={columns} data={products} />
      </main>
    </div>
  );
};
