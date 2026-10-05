import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const OrderSummary = ({ items = [], subtotal = 0, shipping = 0, discount = 0, total = 0 }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#ffffff', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        Order Review ({items.length} items)
      </h3>

      <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-main)', flex: 1, paddingRight: '0.5rem' }}>
              {item.quantity}x {item.product.name}
            </span>
            <span style={{ fontWeight: '600', color: '#ffffff' }}>
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Subtotal</span>
          <span style={{ color: '#ffffff' }}>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-500)' }}>
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Shipping</span>
          <span style={{ color: '#ffffff' }}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary-400)' }}>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
