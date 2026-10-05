import React from 'react';
import { Truck, Zap, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const ShippingMethod = ({ selectedMethod, onSelect }) => {
  const methods = [
    {
      id: 'standard',
      name: 'Standard Ground Shipping',
      eta: '3-5 business days',
      cost: 0.00,
      icon: <Truck size={20} color="var(--primary-400)" />,
    },
    {
      id: 'express',
      name: 'Express Air Priority',
      eta: '1-2 business days',
      cost: 14.99,
      icon: <Zap size={20} color="#f59e0b" />,
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Shipping Method</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {methods.map((method) => {
          const isChecked = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id, method.cost)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: isChecked ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {method.icon}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#ffffff' }}>{method.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{method.eta}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                {method.cost === 0 ? 'FREE' : formatCurrency(method.cost)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
