import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nextgenService from '../services/nextgenService';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../context/CurrencyContext';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await nextgenService.getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (col) => {
    const url = `${window.location.origin}/collections?token=${col.share_token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(col.id);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✨ Curated Product Collections
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
          Explore hand-picked themed collections designed for work, entertainment, and modern living.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading collections...</div>
      ) : collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg, #fff)', borderRadius: '16px' }}>
          No collections found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {collections.map((col) => (
            <div
              key={col.id}
              style={{
                background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px' }}>{col.name}</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                    {col.description} &bull; Curated by <b>@{col.creator_username || 'SmartCart'}</b> &bull; {col.views_count} views
                  </p>
                </div>
                <button
                  onClick={() => handleShare(col)}
                  style={{
                    background: copiedToken === col.id ? '#10b981' : 'var(--bg-secondary, #f1f5f9)',
                    color: copiedToken === col.id ? '#fff' : 'var(--text-primary, #1e293b)',
                    border: '1px solid var(--border-color, #cbd5e1)', padding: '6px 14px', borderRadius: '8px',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  🔗 {copiedToken === col.id ? 'Share Link Copied!' : 'Share Collection'}
                </button>
              </div>

              {/* Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {col.products?.map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px',
                      padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', display: 'flex', flexDirection: 'column'
                    }}
                  >
                    <div 
                      onClick={() => navigate(`/products/${prod.slug || prod.id}`)}
                      style={{ cursor: 'pointer', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '8px', marginBottom: '10px' }}
                    >
                      {prod.images && prod.images.length > 0 ? (
                        <img src={prod.images[0].image} alt={prod.name} style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '2.5rem' }}>📦</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>{prod.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-color, #2563eb)' }}>{formatPrice(prod.price)}</span>
                      <button
                        onClick={() => addToCart(prod.id, 1, prod)}
                        style={{
                          background: 'var(--primary-color, #2563eb)', color: '#fff',
                          border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        + Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
