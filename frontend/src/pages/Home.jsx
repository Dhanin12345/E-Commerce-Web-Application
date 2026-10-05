import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import VoiceSearchModal from '../components/search/VoiceSearchModal';
import VisualSearchModal from '../components/common/VisualSearchModal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  TrendingUp,
  Clock,
  Flame,
  Search,
  Scale,
  Mic,
  Camera,
  Layers,
  Tag,
} from 'lucide-react';

export const Home = () => {
  const { products, categories, loading } = useProducts();
  const { t } = useLanguage();
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch AI recommendations & trending
    const fetchRecommendations = async () => {
      try {
        const [recRes, trendRes] = await Promise.all([
          api.get('/recommendations/'),
          api.get('/recommendations/trending/'),
        ]);
        setRecommended(recRes.data || []);
        setTrending(trendRes.data || []);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    };
    fetchRecommendations();

    // 2. Load recently viewed from localStorage
    try {
      const stored = localStorage.getItem('smartcart_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored).slice(0, 4));
      }
    } catch (e) {
      console.warn('Recently viewed parse error', e);
    }
  }, []);

  const trendingKeywords = [
    'Wireless Headphones',
    'Gaming Laptop',
    'Mechanical Keyboard',
    'Ergonomic Mouse',
    'Smart Watch',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* Modals for Voice & Visual search triggered from Hero */}
      <VoiceSearchModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <VisualSearchModal isOpen={visualOpen} onClose={() => setVisualOpen(false)} />

      {/* 8. INTELLIGENT HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 0 3.5rem 0',
          background: 'radial-gradient(ellipse at top, rgba(79, 70, 229, 0.16), transparent 70%)',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(79, 70, 229, 0.12)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: 'var(--primary-300)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={16} /> Intelligent Commerce Platform • L1–L10 Architecture
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              maxWidth: '820px',
              marginBottom: '1rem',
              color: 'var(--text-main)',
              lineHeight: 1.15,
            }}
          >
            Find what you need{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              faster
            </span>
            .
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
              maxWidth: '580px',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            AI-powered discovery, real-time telemetry, multi-seller fulfillment, and instant natural language shopping assistance.
          </p>

          {/* Quick Actions Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
              <Search size={16} /> Find Products
            </Link>

            <Link to="/compare" className="btn btn-secondary" style={{ padding: '0.7rem 1.4rem' }}>
              <Scale size={16} /> Compare Products
            </Link>

            <button
              onClick={() => setVoiceOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.7rem 1.4rem' }}
            >
              <Mic size={16} color="var(--primary-400)" /> Voice Search
            </button>

            <button
              onClick={() => setVisualOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.7rem 1.4rem' }}
            >
              <Camera size={16} color="var(--accent-500)" /> Visual Search
            </button>
          </div>

          {/* Below: Trending searches & Popular categories */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              maxWidth: '700px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Trending Searches:
              </span>
              {trendingKeywords.map((kw, idx) => (
                <Link
                  key={idx}
                  to={`/search?q=${encodeURIComponent(kw)}`}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-input)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {kw}
                </Link>
              ))}
            </div>

            {categories.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Popular Categories:
                </span>
                {categories.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?category=${c.slug}`}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--primary-400)',
                      fontWeight: 600,
                    }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Personalized Recommendations */}
      {recommended.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={22} color="var(--primary-400)" />
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Personalized Recommendations
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Curated by SmartCart AI based on approved catalog data and browsing habits
                </p>
              </div>
            </div>
            <Link to="/products" style={{ color: 'var(--primary-400)', fontSize: '0.88rem', fontWeight: 600 }}>
              View All
            </Link>
          </div>
          <ProductGrid products={recommended.slice(0, 4)} loading={false} />
        </section>
      )}

      {/* Categories Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>Browse Categories</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Explore verified enterprise hardware & accessories</p>
          </div>
          <Link to="/products" style={{ color: 'var(--primary-400)', fontSize: '0.88rem', fontWeight: '600' }}>
            View All
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="glass-panel"
              style={{
                padding: '1.5rem 1.25rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--primary-400)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>{category.name}</h3>
                <ArrowRight size={16} color="var(--primary-400)" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {category.description || 'Enterprise catalog collection'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Flame size={22} color="#f59e0b" />
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Trending Products
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  High-velocity customer favorites with verified reviews
                </p>
              </div>
            </div>
            <Link to="/products" style={{ color: 'var(--primary-400)', fontSize: '0.88rem', fontWeight: 600 }}>
              See Trending
            </Link>
          </div>
          <ProductGrid products={trending.slice(0, 4)} loading={false} />
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Clock size={20} color="var(--text-muted)" />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Recently Viewed
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Resume where you left off</p>
            </div>
          </div>
          <ProductGrid products={recentlyViewed} loading={false} />
        </section>
      )}

      {/* Smart Product Collections / Popular Products */}
      <section id="featured" className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>Popular Catalog</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full collection of developer-grade hardware</p>
          </div>
          <Link to="/products" style={{ color: 'var(--primary-400)', fontSize: '0.88rem', fontWeight: '600' }}>
            Browse Entire Catalog
          </Link>
        </div>

        <ProductGrid products={products} loading={loading} />
      </section>

      {/* Special Offers & Enterprise Guarantees */}
      <section className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary-400)' }}>
              <Zap size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Instant Dispatch
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Orders ship same-day with live courier telemetry and multi-warehouse routing.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-500)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Verified Guarantee
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Authentic hardware protected by automated fraud checks and 30-day returns.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-500)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                AI Price Protection
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Automated price-drop tracking, restock alerts, and personalized coupon offers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
