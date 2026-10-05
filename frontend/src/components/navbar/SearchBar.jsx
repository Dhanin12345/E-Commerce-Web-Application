import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Camera, Sparkles, ArrowRight, Clock, Trash2, X, TrendingUp, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import VisualSearchModal from '../common/VisualSearchModal';
import VoiceSearchModal from '../search/VoiceSearchModal';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const trendingSearches = [
    'Wireless Headphones',
    'Gaming Laptop',
    'Mechanical Keyboard',
    'Ergonomic Mouse',
    '4K Monitor',
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartcart_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        const defaults = ['Wireless headphones', 'Gaming laptop', 'Smart watch'];
        setRecentSearches(defaults);
        localStorage.setItem('smartcart_recent_searches', JSON.stringify(defaults));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const saveRecentSearch = (text) => {
    if (!text || !text.trim()) return;
    try {
      const cleaned = text.trim();
      const updated = [cleaned, ...recentSearches.filter((s) => s.toLowerCase() !== cleaned.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('smartcart_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const removeRecentSearch = (itemToRemove, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem('smartcart_recent_searches', JSON.stringify(updated));
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('smartcart_recent_searches');
  };

  // Debounced smart suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setCorrectedQuery(null);
      setCategories([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search/suggestions/?q=${encodeURIComponent(query.trim())}`);
        if (res.data) {
          setSuggestions(res.data.suggestions || []);
          setCorrectedQuery(res.data.corrected_query || null);
          setCategories(res.data.categories || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Smart search error', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectRecent = (item) => {
    setQuery(item);
    saveRecentSearch(item);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(item)}`);
  };

  const handleAskAI = () => {
    setIsOpen(false);
    if (query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}&ai=true`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: isOpen ? '1px solid var(--border-focus)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '0.45rem 0.85rem',
          width: '100%',
          boxShadow: isOpen ? '0 0 16px rgba(79, 70, 229, 0.28)' : 'none',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search products, brands, categories or ask AI..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products or ask AI"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            width: '100%',
            outline: 'none',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            title="Clear search input"
          >
            <X size={15} />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          title="Search by Voice (AI Assistant)"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--primary-400)',
            marginLeft: '0.35rem',
            flexShrink: 0,
            transition: 'background var(--transition-fast)',
          }}
        >
          <Mic size={16} />
        </button>

        {/* Visual Search Button */}
        <button
          type="button"
          onClick={() => setIsVisualSearchOpen(true)}
          title="Search by Product Photo (Visual Search)"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--primary-400)',
            marginLeft: '0.15rem',
            flexShrink: 0,
            transition: 'background var(--transition-fast)',
          }}
        >
          <Camera size={16} />
        </button>
      </form>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />

      {/* Intelligent Search Dropdown Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1rem',
            zIndex: 999,
            maxHeight: '440px',
            overflowY: 'auto',
          }}
        >
          {/* Ask AI Banner Option */}
          <div
            onClick={handleAskAI}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)',
              border: '1px solid rgba(79, 70, 229, 0.35)',
              cursor: 'pointer',
              marginBottom: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--primary-400)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {query ? `Ask AI: "${query}"` : 'Ask SmartCart AI Copilot'}
              </span>
            </div>
            <ArrowRight size={14} color="var(--primary-400)" />
          </div>

          {/* Typo Correction Helper */}
          {correctedQuery && (
            <div
              onClick={() => {
                setQuery(correctedQuery);
                saveRecentSearch(correctedQuery);
                navigate(`/search?q=${encodeURIComponent(correctedQuery)}`);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--primary-300)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                marginBottom: '0.65rem',
              }}
            >
              <Sparkles size={14} />
              <span>Did you mean: <strong>{correctedQuery}</strong>?</span>
            </div>
          )}

          {/* Matched Categories */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {categories.map((c) => (
                <span
                  key={c.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/products?category=${c.slug}`);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  In {c.name}
                </span>
              ))}
            </div>
          )}

          {/* Suggested Products list when query is typed */}
          {suggestions.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                Suggested Products
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/products/${p.id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.category} • ★ {p.rating}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary-400)' }}>
                      {formatPrice(p.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent Searches
                </span>
                <button
                  onClick={clearAllRecent}
                  style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  Clear all
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectRecent(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      color: 'var(--text-main)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      <span>{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(item, e)}
                      style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Tags */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              <TrendingUp size={13} color="#f59e0b" /> Trending Searches
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {trendingSearches.map((tag, idx) => (
                <span
                  key={idx}
                  onClick={() => handleSelectRecent(tag)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-400)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
