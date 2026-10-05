import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatCurrency';

export const OrderSuccess = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;
  const transactionId = location.state?.transactionId;
  const totalAmount = location.state?.totalAmount;

  if (!orderNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle size={40} />
        </div>

        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.75rem' }}>
          Payment Successful!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Thank you for choosing SmartCart. We've received your order and are getting it ready for dispatch.
        </p>

        {/* Receipt Box */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
            <strong style={{ color: 'var(--primary-300)' }}>{orderNumber}</strong>
          </div>
          {transactionId && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
              <span style={{ color: '#ffffff' }}>{transactionId}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
            <strong style={{ color: '#ffffff' }}>{formatCurrency(totalAmount)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${orderNumber}/track`}>
            <Button variant="primary" size="md">
              <Package size={16} /> Track Order
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="secondary" size="md">
              Continue Shopping <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
