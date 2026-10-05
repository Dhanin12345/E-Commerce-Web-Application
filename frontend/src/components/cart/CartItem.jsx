import React from 'react';
import { Trash2 } from 'lucide-react';
import { QuantityControl } from './QuantityControl';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity, subtotal } = item;
  const rawImage = product?.images?.[0]?.image;
  const image = rawImage ? (rawImage.startsWith('http') ? rawImage : `http://127.0.0.1:8000${rawImage}`) : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--border-color)',
        gap: '1rem',
      }}
    >
      {/* Product Image & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1e293b',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Item</span>
          )}
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
            {product.name}
          </h4>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Unit: {formatCurrency(product.current_price || product.price)}
          </span>
        </div>
      </div>

      {/* Stepper Quantity Control */}
      <div>
        <QuantityControl
          quantity={quantity}
          onIncrease={() => onUpdateQuantity(item.id, quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.id, quantity - 1)}
        />
      </div>

      {/* Subtotal & Delete Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '100px', justifyContent: 'flex-end' }}>
        <span style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>
          {formatCurrency(subtotal)}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          style={{ background: 'transparent', color: 'var(--danger-500)', padding: '0.25rem' }}
          title="Remove from cart"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
