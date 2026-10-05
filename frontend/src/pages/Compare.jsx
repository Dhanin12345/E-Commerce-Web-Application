import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../context/CurrencyContext';
import { Scale, Trash2, ShoppingCart, Star, CheckCircle, XCircle } from 'lucide-react';

export const Compare = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  if (compareItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--primary-400)',
          }}
        >
          <Scale size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
          No Products Selected for Comparison
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 2rem' }}>
          Browse our dynamic product catalog and click the "Compare" button on any item to evaluate specs side-by-side.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Product Comparison
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Evaluating {compareItems.length} product{compareItems.length > 1 ? 's' : ''} side-by-side
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Trash2 size={16} />
          Clear Comparison
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div
        style={{
          overflowX: 'auto',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '1.25rem', width: '220px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>
                Feature / Spec
              </th>
              {compareItems.map((p) => (
                <th key={p.id} style={{ padding: '1.25rem', minWidth: '240px', verticalAlign: 'top' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      title="Remove product"
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                        {p.name}
                      </div>
                    </Link>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-400)', marginBottom: '0.75rem' }}>
                      {formatPrice(p.current_price || p.price)}
                    </div>
                    <button
                      onClick={() => addToCart(p.id, 1, p)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <ShoppingCart size={15} />
                      Add to Cart
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Rating & Reviews
              </td>
              {compareItems.map((p) => (
                <td key={p.id} style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontWeight: '700' }}>
                    <Star size={16} fill="#f59e0b" />
                    <span>{p.rating_avg || 5.0}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.8rem' }}>
                      ({p.reviews_count || 12} reviews)
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Stock Status
              </td>
              {compareItems.map((p) => (
                <td key={p.id} style={{ padding: '1rem 1.25rem' }}>
                  {p.stock > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success-500)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <CheckCircle size={15} /> In Stock ({p.stock} units)
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--danger-500)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <XCircle size={15} /> Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Category
              </td>
              {compareItems.map((p) => (
                <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.88rem' }}>
                  {p.category_details?.name || 'Smart Electronics'}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                SKU Identification
              </td>
              {compareItems.map((p) => (
                <td key={p.id} style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {p.sku || `SKU-${p.id}`}
                </td>
              ))}
            </tr>

            <tr>
              <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Catalog Description
              </td>
              {compareItems.map((p) => (
                <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                  {p.description}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
