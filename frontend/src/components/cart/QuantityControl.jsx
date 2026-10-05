import React from 'react';
import { Plus, Minus } from 'lucide-react';

export const QuantityControl = ({ quantity, onIncrease, onDecrease, min = 1, max = 99 }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        style={{
          padding: '0.4rem 0.6rem',
          background: 'transparent',
          color: quantity <= min ? 'var(--text-muted)' : 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: quantity <= min ? 0.5 : 1,
        }}
      >
        <Minus size={14} />
      </button>

      <span
        style={{
          padding: '0 0.75rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#ffffff',
          minWidth: '32px',
          textAlign: 'center',
        }}
      >
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        style={{
          padding: '0.4rem 0.6rem',
          background: 'transparent',
          color: quantity >= max ? 'var(--text-muted)' : 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: quantity >= max ? 0.5 : 1,
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
