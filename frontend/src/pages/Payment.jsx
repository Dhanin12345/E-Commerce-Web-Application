import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { PaymentForm } from '../components/checkout/PaymentForm';
import { formatCurrency } from '../utils/formatCurrency';
import { ShieldCheck } from 'lucide-react';

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber;
  const totalAmount = location.state?.totalAmount;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!orderNumber || !totalAmount) {
    return <Navigate to="/cart" replace />;
  }

  const handlePaymentSubmit = async (paymentData) => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.processPayment({
        order_number: orderNumber,
        ...paymentData,
      });

      navigate('/order-success', {
        state: {
          orderNumber,
          transactionId: response.transaction_id,
          totalAmount,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '680px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Secure Payment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Order ID: <strong style={{ color: 'var(--primary-300)' }}>{orderNumber}</strong> • Total Due: <strong style={{ color: '#ffffff' }}>{formatCurrency(totalAmount)}</strong>
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-500)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <PaymentForm totalAmount={totalAmount} onSubmit={handlePaymentSubmit} loading={loading} />
    </div>
  );
};
