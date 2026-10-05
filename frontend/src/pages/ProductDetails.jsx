import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import api from '../services/api';
import { ProductGallery } from '../components/product/ProductGallery';
import { Rating } from '../components/product/Rating';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { QuantityControl } from '../components/cart/QuantityControl';
import { ProductGrid } from '../components/product/ProductGrid';
import { useCart } from '../hooks/useCart';
import { WishlistContext } from '../context/WishlistContext';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import ARPreviewModal from '../components/common/ARPreviewModal';
import SmartBundlesWidget from '../components/product/SmartBundlesWidget';
import nextgenService from '../services/nextgenService';
import {
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Check,
  Bell,
  TrendingDown,
  Scale,
  Sparkles,
  X,
  CheckCircle,
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isSaved } = useContext(WishlistContext);
  const { isAuthenticated, user } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCompare, removeFromCompare, isComparing } = useCompare();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Recommendations state
  const [similarProducts, setSimilarProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  // Price & Stock Alert state
  const [priceAlertModal, setPriceAlertModal] = useState(false);
  const [stockAlertModal, setStockAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Next-Gen Feature states
  const [arModalOpen, setArModalOpen] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('560001');
  const [reviewInsights, setReviewInsights] = useState(null);
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const prod = await productService.getProductById(id);
      setProduct(prod);
      setTargetPrice((parseFloat(prod.current_price || prod.price) * 0.9).toFixed(2));

      const [revs, simRes, freqRes, insights, deliv] = await Promise.all([
        reviewService.getProductReviews(id),
        api.get(`/recommendations/similar/${id}/`).catch(() => ({ data: [] })),
        api.get(`/recommendations/frequently-bought/${id}/`).catch(() => ({ data: [] })),
        nextgenService.getReviewInsights(prod.id).catch(() => null),
        nextgenService.getDeliveryEstimate(pincodeInput).catch(() => null)
      ]);

      setReviews(revs.results || revs);
      setSimilarProducts(simRes.data || []);
      setFrequentlyBought(freqRes.data || []);
      if (insights) setReviewInsights(insights);
      if (deliv) setDeliveryEstimate(deliv);

      // Record behavior view event & recently viewed
      api.post('/analytics/events/', { event_type: 'VIEW', payload: { product_id: prod.id, name: prod.name } }).catch(() => {});
      try {
        const stored = localStorage.getItem('smartcart_recently_viewed');
        let items = stored ? JSON.parse(stored) : [];
        items = items.filter((p) => p.id !== prod.id);
        items.unshift(prod);
        localStorage.setItem('smartcart_recently_viewed', JSON.stringify(items.slice(0, 8)));
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity, product);
    navigate('/checkout');
  };

  const handleCreatePriceAlert = async (e) => {
    e.preventDefault();
    if (!targetPrice) return;
    try {
      await api.post('/alerts/price/', {
        product: product.id,
        target_price: targetPrice,
      });
      setAlertSuccess(true);
      setTimeout(() => {
        setPriceAlertModal(false);
        setAlertSuccess(false);
      }, 2000);
    } catch (err) {
      setAlertError('Please log in to set target price alerts.');
    }
  };

  const handleCreateStockAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alerts/stock/', {
        product: product.id,
        email: user?.email || guestEmail,
      });
      setAlertSuccess(true);
      setTimeout(() => {
        setStockAlertModal(false);
        setAlertSuccess(false);
      }, 2000);
    } catch (err) {
      setAlertError('Could not subscribe. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.submitReview({
        product: product.id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      await fetchDetails();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader text="Loading product details and intelligence..." />;
  if (!product)
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        Product not found.
      </div>
    );

  const saved = isSaved(product.id);
  const comparing = isComparing(product.id);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link> /{' '}
        <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Products</Link> /{' '}
        <span style={{ color: 'var(--text-main)' }}>{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
        <ProductGallery images={product.images} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category_details?.name || 'Category'}
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Rating value={product.rating_avg} count={product.reviews_count} size={18} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {formatPrice(product.current_price || product.price)}
            </span>
            {product.discount_price && product.discount_price < product.price && (
              <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {formatPrice(product.price)}
              </span>
            )}
            <span
              style={{
                marginLeft: 'auto',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '700',
                backgroundColor: product.is_in_stock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: product.is_in_stock ? 'var(--success-500)' : 'var(--danger-500)',
              }}
            >
              {product.is_in_stock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Smart Feature Action Pills: Price Alert, Stock Alert, Compare */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
            <button
              onClick={() => setPriceAlertModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <TrendingDown size={15} color="var(--primary-400)" />
              Set Price Drop Alert
            </button>

            {!product.is_in_stock && (
              <button
                onClick={() => setStockAlertModal(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Bell size={15} color="#f59e0b" />
                Notify Me When in Stock
              </button>
            )}

            <button
              onClick={() => (comparing ? removeFromCompare(product.id) : addToCompare(product))}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: comparing ? 'var(--accent-500)' : 'var(--border-color)',
                color: comparing ? 'var(--accent-500)' : 'var(--text-main)',
              }}
            >
              <Scale size={15} />
              {comparing ? 'In Comparison' : 'Compare'}
            </button>

            {/* AR / 3D Virtual Preview (Requirement 3) */}
            <button
              onClick={() => setArModalOpen(true)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: '#8b5cf6',
                color: '#8b5cf6',
                fontWeight: 600,
              }}
            >
              🥽 3D / AR View
            </button>
          </div>

          {/* Seller & Warranty Meta */}
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Sold by: </span>
              <strong style={{ color: 'var(--primary-300)' }}>{product.seller_name || 'SmartCart Direct Verified'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Warranty: </span>
              <strong>{product.warranty || '1-Year Enterprise Warranty'}</strong>
            </div>
          </div>

          {/* AI PRODUCT INSIGHTS PANEL (Requirement 11) */}
          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid rgba(79, 70, 229, 0.35)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              <Sparkles size={16} /> AI Product Insights
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓</span>
                <span>{product.rating_avg >= 4.5 ? `High customer satisfaction score (★ ${product.rating_avg} rating)` : 'Verified customer feedback & positive build quality reviews'}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓</span>
                <span>{product.is_in_stock ? `Readily available in stock (${product.stock} units reserved for regional fulfillment)` : 'Popular high-demand item with automatic back-in-stock notification'}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓</span>
                <span>Top trending selection in {product.category_details?.name || 'Smart Electronics'}</span>
              </li>
            </ul>
            <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Based on approved product data
            </div>
          </div>

          {/* Quantity & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            {product.is_in_stock ? (
              <>
                <QuantityControl
                  quantity={quantity}
                  onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  max={product.stock}
                />

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  {added ? (
                    <>
                      <Check size={18} style={{ marginRight: '0.5rem' }} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} /> Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  style={{
                    backgroundColor: 'var(--primary-600)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                  }}
                >
                  Buy Now
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStockAlertModal(true)}
                style={{ flex: 1 }}
              >
                <Bell size={18} style={{ marginRight: '0.5rem' }} /> Back-in-Stock Subscription
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => toggleWishlist(product.id)}
              style={{
                padding: '0.85rem',
                color: saved ? '#ef4444' : 'var(--text-main)',
              }}
              title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={20} fill={saved ? '#ef4444' : 'none'} />
            </Button>
          </div>

          {/* Subscribe & Save 10% (Requirement 18) */}
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--primary-400)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔄 Subscribe & Save 10%
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-deliver every 30 days. Cancel or pause anytime.</div>
            </div>
            <button
              onClick={async () => {
                if (!isAuthenticated) { alert('Please log in to start a recurring subscription.'); return; }
                try {
                  await nextgenService.createSubscription(product.id, 'MONTHLY');
                  setSubscribedMsg('🎉 Subscribed! 10% discount applied to recurring shipments.');
                  setTimeout(() => setSubscribedMsg(''), 5000);
                } catch (e) {
                  alert('Could not start subscription. Please try again.');
                }
              }}
              style={{ background: 'var(--primary-500)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Subscribe
            </button>
          </div>
          {subscribedMsg && (
            <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              {subscribedMsg}
            </div>
          )}

          {/* Real-time Delivery Estimation (Requirement 21) */}
          <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} color="var(--primary-400)" /> Estimated Delivery
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-500)' }}>
                {deliveryEstimate ? deliveryEstimate.estimated_range : 'Oct 2 – Oct 4, 2026'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                style={{ width: '130px', padding: '3px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
              <button
                type="button"
                onClick={async () => {
                  const res = await nextgenService.getDeliveryEstimate(pincodeInput);
                  if (res) setDeliveryEstimate(res);
                }}
                style={{ padding: '3px 10px', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: 'var(--primary-500)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Check
              </button>
            </div>
          </div>

          {/* Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck size={20} color="var(--primary-400)" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-main)' }}>Free Tracked Delivery</strong>
                <span style={{ color: 'var(--text-muted)' }}>Over $50.00 cart value</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--success-500)" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-main)' }}>30-Day Hassle-Free Returns</strong>
                <span style={{ color: 'var(--text-muted)' }}>Instant refund guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Product Bundles (Requirement 4) */}
      <SmartBundlesWidget productId={product.id} />

      {/* Frequently Bought Together (AI Recommendation Feature 1) */}
      {frequentlyBought.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="var(--primary-400)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Frequently Bought Together
            </h2>
          </div>
          <ProductGrid products={frequentlyBought} loading={false} />
        </section>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Similar Products in {product.category_details?.name || 'Category'}
          </h2>
          <ProductGrid products={similarProducts} loading={false} />
        </section>
      )}

      {/* Specifications Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Technical Specifications
        </h2>
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', width: '30%', fontWeight: 600 }}>SKU Identifier</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>{product.sku || `SMART-${product.id}-X`}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{product.category_details?.name || 'Smart Tech Hardware'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Seller & Provenance</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{product.seller_name || 'SmartCart Direct Verified'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Warranty Coverage</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{product.warranty || '1-Year Enterprise Replacement Guarantee'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inventory Status</td>
                <td style={{ padding: '0.75rem', color: product.stock > 0 ? 'var(--success-500)' : 'var(--danger-500)', fontWeight: 600 }}>
                  {product.stock > 0 ? `${product.stock} units available (Central Hub)` : 'Out of stock'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Compliance & Telemetry</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>FCC, CE, RoHS, SmartCart IoT Certified</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Customer Questions & Answers */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Customer Questions & Answers
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Q: Does this device include the USB-C high-speed charging cable and power adapter?
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--primary-400)' }}>A (SmartCart Verified):</strong> Yes, all retail units include the braided 100W USB-C cable and regional fast charger in the box.
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Q: What is the return procedure if I change my mind within 30 days?
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--primary-400)' }}>A (SmartCart Support):</strong> You can initiate a 1-click return directly from your Order Tracking page. A prepaid courier pickup will be arranged automatically.
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
          Customer Reviews & Ratings ({product.reviews_count})
        </h2>

        {/* Customer Review Insights (Requirement 12) */}
        {reviewInsights && (
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 AI Review Insights & Thematic Sentiment
              </span>
              <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Aggregated from {reviewInsights.total_reviews_analyzed} Verified Reviews
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>Frequently Praised Themes:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {reviewInsights.positive_themes?.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                      👍 {t.theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>Mixed Feedback / Areas of Note:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {reviewInsights.negative_themes?.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                      ⚠️ {t.theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ℹ️ {reviewInsights.disclaimer}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
          {/* Review Submission Form */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Write a Review</h3>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Rating: {newRating} Stars
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newRating}
                    onChange={(e) => setNewRating(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Your Experience
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Share honest feedback about build quality, performance, or battery..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      resize: 'none',
                    }}
                  />
                </div>

                <Button variant="primary" size="md" type="submit" loading={submittingReview}>
                  Submit Verified Review
                </Button>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Please <Link to="/login" style={{ color: 'var(--primary-400)' }}>sign in</Link> to share a review for this product.
              </p>
            )}
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Rating value={rev.rating} size={15} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Price Alert Modal */}
      {priceAlertModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={20} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Smart Price Alert</h3>
              </div>
              <button
                onClick={() => setPriceAlertModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {alertSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle size={40} color="var(--success-500)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Price Alert Activated!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  We'll notify you as soon as the price reaches your target of {formatPrice(targetPrice)}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreatePriceAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Current Price: <strong>{formatPrice(product.current_price || product.price)}</strong>. Set your target price below:
                </p>

                {alertError && <div style={{ color: 'var(--danger-500)', fontSize: '0.82rem' }}>{alertError}</div>}

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Target Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.9rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setPriceAlertModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    Set Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Stock Alert Modal */}
      {stockAlertModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Back-in-Stock Alert</h3>
              </div>
              <button
                onClick={() => setStockAlertModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {alertSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle size={40} color="var(--success-500)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Subscribed!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  We will notify you immediately once {product.name} is restocked.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateStockAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  This product is currently out of stock. Leave your email and we'll send you an instant alert when inventory arrives:
                </p>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={user?.email || guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.9rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setStockAlertModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AR / 3D Virtual Placement Modal (Requirement 3) */}
      <ARPreviewModal 
        isOpen={arModalOpen} 
        onClose={() => setArModalOpen(false)} 
        product={product} 
      />
    </div>
  );
};
