import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const SalesChart = ({ data = [] }) => {
  const defaultData = [
    { day: 'Mon', revenue: 1420 },
    { day: 'Tue', revenue: 2100 },
    { day: 'Wed', revenue: 1850 },
    { day: 'Thu', revenue: 2890 },
    { day: 'Fri', revenue: 3450 },
    { day: 'Sat', revenue: 4120 },
    { day: 'Sun', revenue: 3800 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 5000);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Revenue Overview</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly sales trajectory</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: '600' }}>
          This Week
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingTop: '1rem' }}>
        {chartData.map((item, idx) => {
          const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              <div
                title={`${item.day}: ${formatCurrency(item.revenue)}`}
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  background: 'linear-gradient(180deg, var(--primary-500) 0%, rgba(99, 102, 241, 0.2) 100%)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'height 500ms ease, background 200ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, var(--accent-500) 0%, rgba(6, 182, 212, 0.4) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, var(--primary-500) 0%, rgba(99, 102, 241, 0.2) 100%)';
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
