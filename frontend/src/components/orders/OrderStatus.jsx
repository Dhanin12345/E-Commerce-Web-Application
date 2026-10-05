import React from 'react';

export const OrderStatus = ({ status }) => {
  const statusStyles = {
    PENDING: { label: 'Pending Payment', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    PAID: { label: 'Paid', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    PROCESSING: { label: 'Processing', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
    SHIPPED: { label: 'Shipped', bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' },
    DELIVERED: { label: 'Delivered', bg: 'rgba(16, 185, 129, 0.25)', color: '#34d399' },
    CANCELLED: { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  };

  const current = statusStyles[status] || { label: status, bg: 'rgba(255, 255, 255, 0.1)', color: '#fff' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: current.bg,
        color: current.color,
        letterSpacing: '0.02em',
      }}
    >
      {current.label}
    </span>
  );
};
