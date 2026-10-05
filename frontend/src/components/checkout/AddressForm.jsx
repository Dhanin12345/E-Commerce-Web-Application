import React from 'react';

export const AddressForm = ({ formData, onChange }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Shipping Address</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Full Name *
          </label>
          <input
            type="text"
            required
            name="full_name"
            value={formData.full_name || ''}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            required
            name="phone"
            value={formData.phone || ''}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Street Address *
        </label>
        <input
          type="text"
          required
          name="street_address"
          value={formData.street_address || ''}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            City *
          </label>
          <input
            type="text"
            required
            name="city"
            value={formData.city || ''}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            State *
          </label>
          <input
            type="text"
            required
            name="state"
            value={formData.state || ''}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Postal Code *
          </label>
          <input
            type="text"
            required
            name="postal_code"
            value={formData.postal_code || ''}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
            }}
          />
        </div>
      </div>
    </div>
  );
};
