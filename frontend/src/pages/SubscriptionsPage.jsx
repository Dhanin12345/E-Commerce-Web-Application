import React, { useState, useEffect } from 'react';
import nextgenService from '../services/nextgenService';
import { useCurrency } from '../context/CurrencyContext';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await nextgenService.getSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      const res = await nextgenService.pauseSubscription(id);
      setActionMsg(res.message);
      loadSubscriptions();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to pause subscription.');
    }
  };

  const handleResume = async (id) => {
    try {
      const res = await nextgenService.resumeSubscription(id);
      setActionMsg(res.message);
      loadSubscriptions();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to resume subscription.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this recurring subscription?')) return;
    try {
      const res = await nextgenService.cancelSubscription(id);
      setActionMsg(res.message);
      loadSubscriptions();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to cancel subscription.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{
        background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>🔄</span>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Subscribe & Save Recurring Orders</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
              Enjoy automated deliveries with guaranteed 10% discount on every replenishment.
            </p>
          </div>
        </div>

        {actionMsg && (
          <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ✅ {actionMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading active subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>No recurring subscriptions yet.</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Choose "Subscribe & Save" on qualifying essentials to automate restocks and save 10%!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.25rem', background: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '14px', flexWrap: 'wrap', gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sub.product_image ? (
                      <img src={sub.product_image} alt={sub.product_name} style={{ maxHeight: '50px', maxWidth: '50px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.75rem' }}>📦</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{sub.product_name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '0.8rem' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
                        background: sub.status === 'ACTIVE' ? '#dcfce7' : (sub.status === 'PAUSED' ? '#fef9c3' : '#fee2e2'),
                        color: sub.status === 'ACTIVE' ? '#15803d' : (sub.status === 'PAUSED' ? '#a16207' : '#b91c1c')
                      }}>
                        {sub.status}
                      </span>
                      <span style={{ color: '#64748b' }}>Frequency: <b>{sub.billing_interval}</b></span>
                      <span style={{ color: '#64748b' }}>Next Billing: <b>{sub.next_billing_date}</b></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color, #2563eb)' }}>
                      {formatPrice(sub.product_price * (1 - sub.discount_pct / 100))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                      10% Subscribe & Save Applied
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {sub.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handlePause(sub.id)}
                        style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Pause
                      </button>
                    ) : sub.status === 'PAUSED' ? (
                      <button
                        onClick={() => handleResume(sub.id)}
                        style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Resume
                      </button>
                    ) : null}

                    {sub.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(sub.id)}
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
