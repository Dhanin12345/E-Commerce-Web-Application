import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';

export const PaymentForm = ({ totalAmount, onSubmit, loading = false }) => {
  const [method, setMethod] = useState('CREDIT_CARD');
  const [cardData, setCardData] = useState({
    number: '•••• •••• •••• 4242',
    name: 'Jane Doe',
    expiry: '12/28',
    cvc: '123',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      payment_method: method,
      card_number: cardData.number,
      card_expiry: cardData.expiry,
      card_cvc: cardData.cvc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Payment Details</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success-500)', fontSize: '0.8rem' }}>
          <Lock size={14} /> Encrypted & Secure
        </div>
      </div>

      {/* Payment Method Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { id: 'CREDIT_CARD', label: 'Credit Card' },
          { id: 'PAYPAL', label: 'PayPal' },
          { id: 'COD', label: 'Cash on Delivery' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: method === m.id ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
              background: method === m.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === 'CREDIT_CARD' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Card Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                }}
              />
              <CreditCard size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Expiration Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                required
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                CVC / Security Code
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={cardData.cvc}
                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {method === 'PAYPAL' && (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            You will be seamlessly connected to PayPal to finalize your payment securely.
          </p>
        </div>
      )}

      {method === 'COD' && (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pay directly in cash when your package is delivered to your doorstep.
          </p>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
        Pay {formatCurrency(totalAmount)}
      </Button>
    </form>
  );
};
