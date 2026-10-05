import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { ArrowLeft } from 'lucide-react';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, loading, setParams } = useProducts({ search: query });

  useEffect(() => {
    setParams({ search: query });
  }, [query]);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to catalog
        </Link>
        <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>
          Search Results for <span style={{ color: 'var(--primary-400)' }}>"{query}"</span>
        </h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Found {products.length} product(s)
        </span>
      </div>

      <ProductGrid products={products} loading={loading} />
    </div>
  );
};
