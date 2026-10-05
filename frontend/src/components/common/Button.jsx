import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, danger, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    border: 'none',
  };

  const sizeStyles = {
    sm: { padding: '0.4rem 0.8rem', fontSize: '0.85rem' },
    md: { padding: '0.65rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: '0.85rem 1.75rem', fontSize: '1.05rem' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: 'var(--text-main)',
      backdropFilter: 'blur(8px)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      background: 'var(--danger-500)',
      color: '#ffffff',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      className={`btn ${className}`}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
};
