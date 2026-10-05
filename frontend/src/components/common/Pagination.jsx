import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={18} />
      </button>

      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.5rem' }}>
        Page <strong style={{ color: '#fff' }}>{currentPage}</strong> of <strong style={{ color: '#fff' }}>{totalPages}</strong>
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
