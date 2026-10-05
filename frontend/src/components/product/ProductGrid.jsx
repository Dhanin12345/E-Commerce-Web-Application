import React from 'react';
import { ProductCard } from './ProductCard';
import { Loader } from '../common/Loader';

export const ProductGrid = ({ products = [], loading = false }) => {
  if (loading) {
    return <Loader text="Loading smart products..." />;
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No products found matching your criteria.</p>
        <span style={{ fontSize: '0.9rem' }}>Try clearing filters or searching for something else.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
