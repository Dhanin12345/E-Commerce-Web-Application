import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';
import { AddressForm } from '../components/checkout/AddressForm';
import { ShippingMethod } from '../components/checkout/ShippingMethod';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { Button } from '../components/common/Button';
import { useCurrency } from '../context/CurrencyContext';
import {
  MapPin,
  Truck,
  CheckCircle2,
  CreditCard,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Wallet,
  QrCode,
  Building2,
  PackageCheck,
} from 'lucide-react';

export const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSummary = location.state?.summary || {};
  const { formatPrice } = useCurrency();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Delivery, 3: Review, 4: Payment, 5: Complete

  const [address, setAddress] = useState({
    full_name: 'Alex Johnson',
    phone: '+1 555-0199',
    street_address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postal_code: '97477',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingCost, setShippingCost] = useState(initialSummary.shipping || 0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const steps = [
    { number: 1, title: 'Address', icon: MapPin },
    { number: 2, title: 'Delivery', icon: Truck },
    { number: 3, title: 'Review', icon: CheckCircle2 },
    { number: 4, title: 'Payment', icon: CreditCard },
    { number: 5, title: 'Complete', icon: Check },
  ];

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleShippingSelect = (id, cost) => {
    setShippingMethod(id);
    setShippingCost(cost);
  };

  const numericSubtotal = parseFloat(cart.total_price || 0);
  const discount = initialSummary.discount || 0;
  const total = Math.max(0, numericSubtotal - discount + shippingCost);

  const handleNextFromAddress = (e) => {
    e?.preventDefault();
    if (!address.full_name || !address.street_address || !address.city || !address.postal_code) {
      setError('Please fill in all required shipping address fields.');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleNextFromDelivery = () => {
    setError('');
    setCurrentStep(3);
  };

  const handleNextFromReview = () => {
    setError('');
    setCurrentStep(4);
  };

  const handleFinalPayment = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedAddress = `${address.full_name}, ${address.street_address}, ${address.city}, ${address.state} ${address.postal_code} (Phone: ${address.phone})`;
      const order = await orderService.createOrder({
        shipping_address: formattedAddress,
        shipping_cost: shippingCost,
        discount_amount: discount,
      });

      setCompletedOrder(order);
      setCurrentStep(5);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment authorization failed. Please verify your billing details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 6rem 1.5rem' }}>
      {/* Step Progress Stepper (Requirement 17) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Secure Checkout
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            maxWidth: '680px',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          {/* Connector Line behind steps */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '40px',
              right: '40px',
              height: '2px',
              backgroundColor: 'var(--border-color)',
              zIndex: 1,
            }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            const Icon = s.icon;

            return (
              <div
                key={s.number}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? 'var(--success-500)'
                      : isCurrent
                      ? 'var(--primary-600)'
                      : 'var(--bg-input)',
                    color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                    border: isCurrent ? '2px solid #ffffff' : '2px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: isCurrent ? '0 0 12px rgba(79, 70, 229, 0.45)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--primary-400)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                  }}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-500)',
            color: '#ef4444',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
          }}
        >
          {error}
        </div>
      )}

      {/* Step 5: Complete Confirmation */}
      {currentStep === 5 ? (
        <div
          className="glass-panel"
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success-500)',
            }}
          >
            <PackageCheck size={40} />
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
            Order Confirmed!
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, fontSize: '0.95rem' }}>
            Thank you for your order. We’ve dispatched an email confirmation and reserved your items in the regional warehouse.
          </p>

          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '380px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Order Reference:</span>
            <strong style={{ color: 'var(--primary-400)' }}>
              {completedOrder?.order_number || 'SMART-ORD-9021'}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to={`/orders/${completedOrder?.order_number || ''}/tracking`}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Track Order Live <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        /* Steps 1-4 Layout: Left Details, Right Sticky Summary */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Main Step Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* STEP 1: Address */}
            {currentStep === 1 && (
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="var(--primary-400)" /> 1. Shipping Address
                </h3>
                <AddressForm formData={address} onChange={handleAddressChange} />
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="lg" onClick={handleNextFromAddress}>
                    Proceed to Delivery <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery */}
            {currentStep === 2 && (
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={20} color="var(--primary-400)" /> 2. Delivery Method
                </h3>
                <ShippingMethod selectedMethod={shippingMethod} onSelect={handleShippingSelect} />
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft size={16} /> Back to Address
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleNextFromDelivery}>
                    Review Order <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {currentStep === 3 && (
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="var(--primary-400)" /> 3. Review Order Items
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {cart.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {item.product?.name || `Product #${item.product_id}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ShieldCheck size={18} color="var(--success-500)" />
                  <span>Verified order with 30-day money-back guarantee & real-time telemetry.</span>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft size={16} /> Back to Delivery
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleNextFromReview}>
                    Proceed to Payment <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment (Requirement 18) */}
            {currentStep === 4 && (
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={20} color="var(--primary-400)" /> 4. Payment Method
                  </h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--success-500)', fontWeight: 600 }}>
                    <Lock size={13} /> 256-Bit Encrypted
                  </span>
                </div>

                {/* Payment Option Selection Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'card', label: 'Credit / Debit', icon: CreditCard },
                    { id: 'upi', label: 'UPI / QR', icon: QrCode },
                    { id: 'wallet', label: 'Store Wallet', icon: Wallet },
                    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  ].map((method) => {
                    const MethodIcon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-input)',
                          border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          textAlign: 'center',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <MethodIcon size={20} color={isSelected ? 'var(--primary-400)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                          {method.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Method Details Input Mock */}
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        defaultValue={address.full_name}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Card Number (Demo Sandbox)
                      </label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          defaultValue="•••"
                          style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                      Scan dynamic QR code or pay to VPA: <strong style={{ color: 'var(--primary-400)' }}>smartcart@enterprise</strong>
                    </p>
                    <div style={{ width: '100px', height: '100px', margin: '0 auto', background: '#ffffff', padding: '6px', borderRadius: '8px' }}>
                      <QrCode size={88} color="#0f172a" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Available Digital Store Credit:</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--success-500)' }}>$1,500.00</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Total amount ({formatPrice(total)}) will be deducted instantly from your verified ledger balance.
                    </span>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Supported: HDFC, ICICI, State Bank, Axis, Citibank Enterprise.
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft size={16} /> Back to Review
                  </Button>
                  <Button variant="primary" size="lg" loading={loading} onClick={handleFinalPayment}>
                    Authorize & Pay {formatPrice(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Order Summary */}
          <aside style={{ position: 'sticky', top: '90px' }}>
            <OrderSummary
              items={cart.items}
              subtotal={numericSubtotal}
              shipping={shippingCost}
              discount={discount}
              total={total}
            />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Checkout;
