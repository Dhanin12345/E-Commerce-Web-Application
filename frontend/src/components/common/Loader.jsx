import React from 'react';

export const Loader = ({ size = 32, text = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: '1rem' }}>
      <div
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--primary-500)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
