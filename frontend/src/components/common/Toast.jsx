import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: { icon: <CheckCircle color="#10b981" size={20} />, bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981' },
    error: { icon: <AlertCircle color="#ef4444" size={20} />, bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444' },
    info: { icon: <Info color="#6366f1" size={20} />, bg: 'rgba(99, 102, 241, 0.1)', border: '#6366f1' },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#1e293b',
        borderLeft: `4px solid ${current.border}`,
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1100,
        maxWidth: '400px',
      }}
    >
      {current.icon}
      <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
