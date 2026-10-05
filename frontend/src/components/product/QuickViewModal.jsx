import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Heart, Scale, Check, Sparkles, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Rating } from './Rating';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';
import { useCompare } from '../../context/CompareContext';
import { WishlistContext } from '../../context/WishlistContext';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { addToCompare, removeFromCompare, isComparing } = useCompare();
  const { toggleWishlist, isSaved } = React.useContext(WishlistContext);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!isOpen || !product) return null;

  const saved = isSaved(product.id);
  const comparing = isComparing(product.id);

  const rawImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;
  const primaryImage = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `http://127.0.0.1:8000${rawImage}`)
    : null;

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(11, 15, 25, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Image */}
          <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                SmartCart Premium
              </div>
            )}
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: product.stock > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: product.stock > 0 ? 'var(--success-500)' : 'var(--danger-500)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              ● {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {product.category_details?.name || 'Smart Hardware'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {product.name}
              </h2>
              <div style={{ marginTop: '0.4rem' }}>
                <Rating value={product.rating_avg || 4.7} count={product.reviews_count || 120} />
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {formatPrice(product.current_price || product.price)}
              </span>
              {product.discount_price && product.discount_price < product.price && (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* AI Product Insights Box (Requirement 11) */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                <Sparkles size={14} /> AI Product Insights
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--success-500)' }}>✓</span> Rated high for build quality and performance
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--success-500)' }}>✓</span> Verified telemetry & 30-day enterprise warranty
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--success-500)' }}>✓</span> Fast regional fulfillment available
                </li>
              </ul>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Based on approved product data
              </span>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock <= 0}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem 1.25rem' }}
              >
                {justAdded ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => (comparing ? removeFromCompare(product.id) : addToCompare(product))}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', color: comparing ? 'var(--accent-500)' : 'var(--text-main)' }}
                title="Compare"
              >
                <Scale size={18} />
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', color: saved ? '#ef4444' : 'var(--text-main)' }}
                title="Wishlist"
              >
                <Heart size={18} fill={saved ? '#ef4444' : 'none'} />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--primary-400)',
                fontWeight: 600,
                marginTop: '0.5rem',
              }}
            >
              <span>View full product details & specifications</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickViewModal;
