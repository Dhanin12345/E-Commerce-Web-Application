import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { Heart } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist, loading } = useContext(WishlistContext);

  if (loading) return <Loader text="Loading your saved items..." />;

  const savedProducts = wishlist.map((item) => item.product).filter(Boolean);

  if (savedProducts.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}
        >
          <Heart size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          Explore the catalog and save the items you love to revisit anytime.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>My Wishlist</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {savedProducts.length} saved item(s)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
