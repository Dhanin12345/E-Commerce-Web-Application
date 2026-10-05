import React, { useState, useEffect } from 'react';
import nextgenService from '../../services/nextgenService';
import { useCurrency } from '../../context/CurrencyContext';

const SmartBundlesWidget = ({ productId }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadBundles();
  }, [productId]);

  const loadBundles = async () => {
    try {
      const data = await nextgenService.getBundles();
      // Filter bundles containing this product if productId provided, or show top bundles
      const relevant = productId 
        ? data.filter((b) => b.products && b.products.some((p) => p.id === Number(productId)))
        : data;
      setBundles(relevant.length > 0 ? relevant : data.slice(0, 1));
    } catch (err) {
      console.error('Failed to load product bundles:', err);
    }
  };

  const handleAddBundle = async (bundleId) => {
    setLoading(true);
    try {
      const res = await nextgenService.addBundleToCart(bundleId);
      setSuccessMsg(res.message || 'Bundle added to cart!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Please log in to add bundles to your cart.');
    } finally {
      setLoading(false);
    }
  };

  if (!bundles || bundles.length === 0) return null;

  return (
    <div style={{
      margin: '2rem 0', padding: '1.5rem',
      background: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚡ Complete Your Setup
          <span style={{ fontSize: '0.75rem', background: '#ec4899', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
            Frequently Bought Together
          </span>
        </h3>
      </div>

      {successMsg && (
        <div style={{ padding: '0.6rem 1rem', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ✅ {successMsg}
        </div>
      )}

      {bundles.map((bundle) => (
        <div key={bundle.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {bundle.products?.map((prod, idx) => (
              <React.Fragment key={prod.id}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'var(--bg-secondary, #f8fafc)', padding: '0.75rem',
                  borderRadius: '10px', width: '120px', textAlign: 'center', border: '1px solid var(--border-color, #e2e8f0)'
                }}>
                  <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {prod.images && prod.images.length > 0 ? (
                      <img src={prod.images[0].image} alt={prod.name} style={{ maxHeight: '60px', maxWidth: '80px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>📦</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {prod.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-color, #2563eb)', fontWeight: 700 }}>
                    {formatPrice(prod.price)}
                  </span>
                </div>
                {idx < bundle.products.length - 1 && (
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)' }}>+</span>
                )}
              </React.Fragment>
            ))}

            {/* Equals & Pricing Box */}
            <div style={{
              marginLeft: 'auto', display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', background: 'var(--bg-secondary, #f1f5f9)',
              padding: '1rem 1.25rem', borderRadius: '12px', minWidth: '180px'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bundle Total Price:</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-color, #2563eb)' }}>
                  {formatPrice(bundle.bundle_price)}
                </span>
                <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                  {formatPrice(bundle.original_price)}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                Save {bundle.discount_pct}% off package
              </span>
              <button
                onClick={() => handleAddBundle(bundle.id)}
                disabled={loading}
                style={{
                  marginTop: '0.75rem', width: '100%',
                  background: 'var(--primary-color, #2563eb)', color: '#fff',
                  border: 'none', padding: '8px 14px', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                {loading ? 'Adding...' : '⚡ Add All to Cart'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartBundlesWidget;
