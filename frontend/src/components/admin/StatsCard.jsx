import React from 'react';

export const StatsCard = ({ title, value, icon, change, isPositive = true }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{title}</span>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: '0.25rem 0' }}>{value}</h3>
        {change && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              color: isPositive ? 'var(--success-500)' : 'var(--danger-500)',
            }}
          >
            {isPositive ? '↑' : '↓'} {change} vs last period
          </span>
        )}
      </div>

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-400)',
        }}
      >
        {icon}
      </div>
    </div>
  );
};
