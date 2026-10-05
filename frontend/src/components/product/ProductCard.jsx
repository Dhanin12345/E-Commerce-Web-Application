import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Scale, Check, Eye } from 'lucide-react';
import { Rating } from './Rating';
import { useCart } from '../../hooks/useCart';
import { WishlistContext } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCompare } from '../../context/CompareContext';
import QuickViewModal from './QuickViewModal';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isSaved } = useContext(WishlistContext);
  const { formatPrice } = useCurrency();
  const { addToCompare, removeFromCompare, isComparing } = useCompare();
  const saved = isSaved(product.id);
  const comparing = isComparing(product.id);

  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const rawImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;
  const primaryImage = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `http://127.0.0.1:8000${rawImage}`)
    : null;

  const brandName = product.brand || product.seller_name || product.category_details?.name || 'SmartCart Select';
  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleProductClick = () => {
    try {
      const stored = localStorage.getItem('smartcart_recently_viewed');
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter((p) => p.id !== product.id);
      items.unshift(product);
      localStorage.setItem('smartcart_recently_viewed', JSON.stringify(items.slice(0, 8)));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || !isInStock) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, 1, product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (comparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
          position: 'relative',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        {/* Product Image Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '80%',
            backgroundColor: 'var(--bg-input)',
            overflow: 'hidden',
          }}
        >
          <Link
            to={`/products/${product.id}`}
            onClick={handleProductClick}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            {primaryImage && !imageError ? (
              <img
                src={primaryImage}
                alt={product.name}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform var(--transition-slow)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                SmartCart Premium
              </div>
            )}
          </Link>

          {/* Quick Action Overlay: Wishlist & Quick View */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              zIndex: 3,
            }}
          >
            <button
              onClick={() => toggleWishlist(product.id)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: saved ? '#ef4444' : '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
              title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={saved ? '#ef4444' : 'none'} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Discount Badge */}
          {product.discount_price && product.discount_price < product.price && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'var(--danger-500)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.04em',
                zIndex: 2,
              }}
            >
              SAVE {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
            </span>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
          {/* Brand */}
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {brandName}
          </span>

          {/* Product Title */}
          <Link to={`/products/${product.id}`} onClick={handleProductClick} style={{ textDecoration: 'none' }}>
            <h4
              style={{
                fontSize: '0.98rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.5rem',
                lineHeight: 1.35,
              }}
            >
              {product.name}
            </h4>
          </Link>

          {/* Rating & Review Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Rating value={product.rating_avg || 4.7} count={product.reviews_count || 14} size={15} />
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {formatPrice(product.current_price || product.price)}
            </span>
            {product.discount_price && product.discount_price < product.price && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status Badge */}
          <div style={{ margin: '0.2rem 0' }}>
            {isInStock ? (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: isLowStock ? 'var(--warning-500)' : 'var(--success-500)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isLowStock ? 'var(--warning-500)' : 'var(--success-500)',
                  }}
                />
                {isLowStock ? `Low Stock (${product.stock} left)` : 'In Stock'}
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: 'var(--danger-500)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--danger-500)' }} />
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Row: [Add to Cart] + [Compare] */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.65rem' }}>
            <button
              id={`add-to-cart-${product.id}`}
              onClick={handleAddToCart}
              disabled={isAdding || !isInStock}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                backgroundColor: justAdded ? 'var(--success-500)' : 'var(--primary-600)',
                color: '#ffffff',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: isInStock ? 'pointer' : 'not-allowed',
                opacity: isInStock ? 1 : 0.6,
                transition: 'all 0.2s ease',
              }}
            >
              {justAdded ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : isAdding ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingCart size={15} /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleToggleCompare}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: comparing ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                border: comparing ? '1px solid var(--accent-500)' : '1px solid var(--border-color)',
                color: comparing ? 'var(--accent-500)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
              title={comparing ? 'In Comparison List' : 'Compare Product'}
            >
              {comparing ? <Check size={14} /> : <Scale size={14} />}
              <span>Compare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
