import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, Box, Navigation } from 'lucide-react';

export const OrderTimeline = ({ currentStatus }) => {
  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'PACKED', label: 'Packed', icon: Box },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  // Map backend status to index
  const getIndex = (st) => {
    switch (st?.toUpperCase()) {
      case 'PENDING':
      case 'PAID':
      case 'CONFIRMED':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'PACKED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const currentIndex = getIndex(currentStatus);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 0.5rem',
        width: '100%',
        position: 'relative',
        overflowX: 'auto',
      }}
    >
      {/* Background connector line */}
      <div
        style={{
          position: 'absolute',
          top: '35px',
          left: '30px',
          right: '30px',
          height: '2px',
          backgroundColor: 'var(--border-color)',
          zIndex: 1,
        }}
      />

      {steps.map((step, idx) => {
        const isPassed = currentIndex >= idx;
        const isCurrent = currentIndex === idx;
        const Icon = step.icon;

        return (
          <div
            key={step.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              position: 'relative',
              flex: 1,
              minWidth: '70px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isPassed ? 'var(--primary-600)' : 'var(--bg-input)',
                border: isCurrent ? '2px solid #ffffff' : '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isPassed ? '#ffffff' : 'var(--text-muted)',
                boxShadow: isCurrent ? '0 0 14px rgba(79, 70, 229, 0.55)' : 'none',
                transition: 'all var(--transition-normal)',
              }}
            >
              <Icon size={17} />
            </div>

            <span
              style={{
                marginTop: '0.65rem',
                fontSize: '0.74rem',
                fontWeight: isCurrent ? '700' : isPassed ? '600' : '400',
                color: isCurrent ? 'var(--primary-400)' : isPassed ? 'var(--text-main)' : 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
