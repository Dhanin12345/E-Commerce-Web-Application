import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { OrderCard } from '../components/orders/OrderCard';
import { Loader } from '../components/common/Loader';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Package } from 'lucide-react';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders();
        setOrders(data.results || data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader text="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <Package size={48} color="var(--primary-400)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>No Orders Placed Yet</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't placed any orders yet. Discover our latest tech gear.</p>
        <Link to="/products">
          <Button variant="primary" size="lg">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.25rem' }}>Order History</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage and track your past purchases</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
