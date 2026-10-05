import React from 'react';
import { Link } from 'react-router-dom';
import { OrderStatus } from './OrderStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { ChevronRight, Package } from 'lucide-react';

export const OrderCard = ({ order }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform var(--transition-fast)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Placed</span>
          <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}>
            {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID</span>
          <div style={{ fontSize: '0.9rem', color: 'var(--primary-300)', fontWeight: '700' }}>
            {order.order_number}
          </div>
        </div>

        <div>
          <OrderStatus status={order.status} />
        </div>
      </div>

      {/* Items preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {order.items?.slice(0, 2).map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Package size={16} color="var(--primary-400)" />
            <span style={{ color: '#ffffff', flex: 1 }}>{item.quantity}x {item.product_name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        {order.items?.length > 2 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            +{order.items.length - 2} more item(s)
          </span>
        )}
      </div>

      {/* Footer & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
            {formatCurrency(order.total_amount)}
          </div>
        </div>

        <Link
          to={`/orders/${order.order_number}/track`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--primary-400)',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          Track Details <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};
