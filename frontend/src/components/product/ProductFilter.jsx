import React from 'react';
import { Filter, RotateCcw, X, Star, Check } from 'lucide-react';

export const ProductFilter = ({
  categories = [],
  filters = {},
  onFilterChange,
  onReset,
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  const activeChips = [];
  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category);
    activeChips.push({ key: 'category', label: `Category: ${cat ? cat.name : filters.category}` });
  }
  if (filters.min_price || filters.max_price) {
    activeChips.push({
      key: 'price',
      label: `$${filters.min_price || 0} - $${filters.max_price || 'Any'}`,
    });
  }
  if (filters.rating) {
    activeChips.push({ key: 'rating', label: `${filters.rating}★ & above` });
  }
  if (filters.in_stock) {
    activeChips.push({ key: 'in_stock', label: 'In Stock Only' });
  }

  const removeChip = (key) => {
    if (key === 'category') onFilterChange({ ...filters, category: undefined });
    if (key === 'price') onFilterChange({ ...filters, min_price: undefined, max_price: undefined });
    if (key === 'rating') onFilterChange({ ...filters, rating: undefined });
    if (key === 'in_stock') onFilterChange({ ...filters, in_stock: undefined });
  };

  return (
    <div
      className={isMobileDrawer ? '' : 'glass-panel'}
      style={{
        padding: isMobileDrawer ? '1.5rem' : '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>
          <Filter size={18} color="var(--primary-400)" />
          <span>Smart Filters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            <span>Clear All</span>
          </button>
          {isMobileDrawer && onCloseDrawer && (
            <button onClick={onCloseDrawer} style={{ background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(79, 70, 229, 0.15)',
                color: 'var(--primary-300)',
                border: '1px solid rgba(79, 70, 229, 0.35)',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(chip.key)}
                style={{ background: 'transparent', color: 'var(--primary-300)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Category Multi-select List */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.65rem' }}>
          Category
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: !filters.category ? 'var(--primary-400)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: !filters.category ? 600 : 400,
            }}
          >
            <input
              type="radio"
              name="cat-filter"
              checked={!filters.category}
              onChange={() => onFilterChange({ ...filters, category: undefined })}
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: filters.category === cat.slug ? 'var(--primary-400)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: filters.category === cat.slug ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="cat-filter"
                checked={filters.category === cat.slug}
                onChange={() => onFilterChange({ ...filters, category: cat.slug })}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Price Range ($)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ''}
            onChange={(e) => onFilterChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ''}
            onChange={(e) => onFilterChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
            }}
          />
        </div>
        {/* Quick price presets */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { label: '<$50', min: 0, max: 50 },
            { label: '$50-$150', min: 50, max: 150 },
            { label: '$150-$500', min: 150, max: 500 },
            { label: '$500+', min: 500, max: 5000 },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onFilterChange({ ...filters, min_price: preset.min, max_price: preset.max })}
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Customer Rating
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="rating-filter"
                checked={filters.rating === stars}
                onChange={() => onFilterChange({ ...filters, rating: stars })}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                {stars}★ <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>& above</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability / In Stock */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={!!filters.in_stock}
            onChange={(e) => onFilterChange({ ...filters, in_stock: e.target.checked ? true : undefined })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </label>
      </div>

      {/* Seller & Delivery Metadata Guarantee */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ✓ All listed sellers are verified with 30-day return protection & regional warehouse fulfillment.
      </div>
    </div>
  );
};

export default ProductFilter;
