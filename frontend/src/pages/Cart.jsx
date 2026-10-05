import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import CartOptimizerBar from '../components/cart/CartOptimizerBar';

export const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cart.items.length) {
    return <Loader text="Loading your cart..." />;
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-400)',
            marginBottom: '1.5rem',
          }}
        >
          <ShoppingBag size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          Looks like you haven't added any smart gadgets yet. Discover our newest collection today.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = (summary) => {
    navigate('/checkout', { state: { summary } });
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Shopping Cart</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {cart.total_items} items in your basket
          </span>
        </div>
        <button
          onClick={clearCart}
          style={{ background: 'transparent', color: 'var(--danger-500)', fontSize: '0.85rem' }}
        >
          Clear Cart
        </button>
      </div>

      {/* Smart Cart Optimization (Requirement 5) */}
      <CartOptimizerBar />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <div style={{ paddingTop: '1.5rem' }}>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-400)', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary Card */}
        <aside>
          <CartSummary subtotal={cart.total_price} onCheckout={handleCheckout} />
        </aside>
      </div>
    </div>
  );
};
