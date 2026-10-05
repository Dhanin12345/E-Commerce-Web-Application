import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/product/ProductFilter';
import { Pagination } from '../components/common/Pagination';
import { Filter, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || undefined;

  const [filters, setFilters] = useState({
    category: categoryParam,
    min_price: undefined,
    max_price: undefined,
    rating: undefined,
    in_stock: undefined,
    ordering: '-created_at',
  });

  const { products, categories, loading, setParams } = useProducts(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setParams(newFilters);
    if (newFilters.category) {
      setSearchParams({ category: newFilters.category });
    } else {
      setSearchParams({});
    }
  };

  const handleReset = () => {
    const emptyFilters = { ordering: '-created_at' };
    setFilters(emptyFilters);
    setParams(emptyFilters);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Product Catalog</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing {products.length} certified products & developer hardware
          </span>
        </div>

        {/* Mobile Filter Trigger & Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="show-on-mobile btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <SlidersHorizontal size={15} /> Filters
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={filters.ordering || '-created_at'}
              onChange={(e) => handleFilterChange({ ...filters, ordering: e.target.value })}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            >
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating_avg">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Catalog */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Desktop Sidebar */}
        <aside className="hide-on-mobile">
          <ProductFilter
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </aside>

        {/* Products Grid or Empty State */}
        <main style={{ width: '100%' }}>
          {products.length === 0 && !loading ? (
            <div
              className="glass-panel"
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(79, 70, 229, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-400)',
                }}
              >
                <Filter size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>No matching products found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>
                We couldn't find any products matching your current filter criteria. Try adjusting your filters.
              </p>
              <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={products} loading={loading} />
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(products.length / 12) || 1}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <ProductFilter
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
