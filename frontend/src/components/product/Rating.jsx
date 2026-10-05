import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({ value = 0, count, size = 16 }) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(numeric) ? '#f59e0b' : 'transparent'}
            color={star <= Math.round(numeric) ? '#f59e0b' : '#64748b'}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', marginLeft: '0.25rem' }}>
        {numeric.toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};
