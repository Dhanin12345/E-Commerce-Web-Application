import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export const CartIcon = () => {
  const { cart } = useCart();
  const count = cart?.total_items || 0;

  return (
    <Link
      to="/cart"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'var(--text-main)',
        transition: 'background var(--transition-fast)',
      }}
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: 'var(--primary-500)',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: '700',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};
