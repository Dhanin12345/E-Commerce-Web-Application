import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';
import { Tag } from 'lucide-react';
import api from '../../services/api';

export const CartSummary = ({ subtotal = 0, onCheckout, checkoutDisabled = false }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const numericSubtotal = typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal;
  const shipping = numericSubtotal > 100 || numericSubtotal === 0 ? 0 : 9.99;
  const total = Math.max(0, numericSubtotal - discount + shipping);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate/', {
        code: couponCode.trim(),
        subtotal: numericSubtotal,
      });
      setDiscount(res.data.discount_amount);
      setCouponApplied(res.data.code);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid promo code.');
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <h3 style={{ fontSize: '1.2rem', color: '#ffffff', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        Order Summary
      </h3>

      {/* Line Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Subtotal</span>
          <span style={{ color: '#ffffff', fontWeight: '600' }}>{formatCurrency(numericSubtotal)}</span>
        </div>

        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-500)' }}>
            <span>Discount ({couponApplied})</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Estimated Shipping</span>
          <span style={{ color: '#ffffff' }}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#ffffff',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <span>Total</span>
          <span style={{ color: 'var(--primary-400)' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Promo Code Input */}
      <form onSubmit={applyCoupon} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input
          type="text"
          placeholder="Promo code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          style={{
            flex: 1,
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
            fontSize: '0.85rem',
          }}
        />
        <Button size="sm" type="submit" loading={loadingCoupon}>
          <Tag size={14} /> Apply
        </Button>
      </form>
      {couponError && <span style={{ color: 'var(--danger-500)', fontSize: '0.8rem' }}>{couponError}</span>}
      {couponApplied && <span style={{ color: 'var(--success-500)', fontSize: '0.8rem' }}>Promo applied!</span>}

      {/* Checkout CTA */}
      <Button
        variant="primary"
        size="lg"
        onClick={() => onCheckout({ subtotal: numericSubtotal, discount, shipping, total })}
        disabled={checkoutDisabled || numericSubtotal === 0}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};
