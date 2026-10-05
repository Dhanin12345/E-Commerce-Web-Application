import React, { useState, useEffect } from 'react';
import nextgenService from '../../services/nextgenService';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';

const CartOptimizerBar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { cart, addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      loadOptimization();
    }
  }, [cart]);

  const loadOptimization = async () => {
    setLoading(true);
    try {
      const res = await nextgenService.getCartOptimization();
      setData(res);
    } catch (err) {
      console.error('Failed to load cart optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0 || !data) return null;

  const threshold = data.free_shipping_threshold || 100;
  const subtotal = data.subtotal || 0;
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      {/* Free Shipping Progress */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🚚 {data.message}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: data.free_shipping_eligible ? '#10b981' : 'var(--primary-color, #2563eb)' }}>
            {progress}%
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: data.free_shipping_eligible ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Suggested Accessories */}
      {data.suggested_accessories && data.suggested_accessories.length > 0 && !data.free_shipping_eligible && (
        <div style={{ borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
            ⚡ Complete your order & get Free Shipping:
          </span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {data.suggested_accessories.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--bg-secondary, #f8fafc)', padding: '4px 10px',
                  borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color, #2563eb)' }}>
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={() => addToCart(item.id, 1)}
                  style={{
                    background: 'var(--primary-color, #2563eb)', color: '#fff',
                    border: 'none', padding: '2px 8px', borderRadius: '4px',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartOptimizerBar;
