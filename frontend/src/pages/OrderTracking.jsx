import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import api from '../services/api';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { OrderStatus } from '../components/orders/OrderStatus';
import { DigitalInvoiceModal } from '../components/orders/DigitalInvoiceModal';
import { Loader } from '../components/common/Loader';
import { useCurrency } from '../context/CurrencyContext';
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  FileText,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const OrderTracking = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrderAndShipment = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderByNumber(orderNumber);
        setOrder(data);

        try {
          const shipRes = await api.get(`/orders/${orderNumber}/tracking/`);
          setShipment(shipRes.data.shipment);
        } catch (e) {
          console.warn('Shipment tracking unavailable yet');
        }
      } catch (err) {
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndShipment();
  }, [orderNumber]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;

    try {
      setSubmittingReturn(true);
      await api.post(`/orders/${orderNumber}/return/`, { reason: returnReason });
      setReturnSuccess(true);
      setTimeout(() => {
        setShowReturnModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return <Loader text="Retrieving live order tracking & courier telemetry..." />;
  if (error || !order)
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger-500)', marginBottom: '1.5rem' }}>{error || 'Order not found.'}</p>
        <Link to="/orders" style={{ color: 'var(--primary-400)' }}>
          View all orders
        </Link>
      </div>
    );

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '840px' }}>
      <Link
        to="/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to order history
      </Link>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header & Quick Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Order #{order.order_number}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <OrderStatus status={order.status} />

            <button
              onClick={() => setShowInvoice(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={15} />
              Digital Invoice
            </button>

            <button
              onClick={() => setShowReturnModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={15} />
              Return / Refund
            </button>
          </div>
        </div>

        {/* Live Delivery Telemetry Card */}
        {shipment && (
          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                <Truck size={15} /> Carrier
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {shipment.courier_name}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Tracking Code
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {shipment.tracking_code}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Current Location
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {shipment.current_location}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--success-500)', marginTop: '0.2rem' }}>
                ● {shipment.current_status}
              </div>
            </div>
          </div>
        )}

        {/* Visual Progress Timeline */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Fulfillment Timeline</h3>
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Shipping Destination */}
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
            <MapPin size={18} color="var(--primary-400)" /> Shipping Destination
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{order.shipping_address}</p>
        </div>

        {/* Items Purchased */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Shipment Package Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={18} color="var(--primary-400)" />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.product_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                  </div>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Total Charged</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-400)' }}>
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Digital Invoice Modal */}
      {showInvoice && (
        <DigitalInvoiceModal orderNumber={order.order_number} onClose={() => setShowInvoice(false)} />
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Request Return & Refund</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {returnSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={48} color="var(--success-500)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Return Requested Successfully!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Our team is processing your request. You will be notified as soon as it is approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.45' }}>
                  Order: <strong>#{order.order_number}</strong> ({formatPrice(order.total_amount)})
                </p>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Reason for Return
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="e.g. Item defective, wrong item received, or changed mind..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.9rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn || !returnReason.trim()}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.5rem' }}
                  >
                    {submittingReturn ? 'Submitting...' : 'Submit Return'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
