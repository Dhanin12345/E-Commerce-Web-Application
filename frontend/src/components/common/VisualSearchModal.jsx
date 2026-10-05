import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import nextgenService from '../../services/nextgenService';
import { useCurrency } from '../../context/CurrencyContext';

const VisualSearchModal = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([
    { name: 'Developer Setup', tag: 'laptop' },
    { name: 'Ergonomic Footwear', tag: 'shoe' }
  ]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
      setResults(null);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      setError('Please select or upload an image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await nextgenService.visualSearch(selectedImage);
      setResults(data);
      setHistory((prev) => [{ name: selectedImage.name, tag: data.detected_features?.[0] || 'visual' }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults(null);
    setError('');
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-primary, #ffffff)',
        color: 'var(--text-primary, #1e293b)',
        borderRadius: '16px', maxWidth: '720px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color, #e2e8f0)',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📷 Visual Product Search
              <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>AI Match</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
              Upload any product photo to find visually similar catalog items with confidence scoring.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #64748b)' }}
          >
            ✕
          </button>
        </div>

        {/* Dropzone / Upload Box */}
        {!imagePreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #94a3b8', borderRadius: '12px',
              padding: '2.5rem 1.5rem', textAlign: 'center',
              cursor: 'pointer', background: 'var(--bg-secondary, #f8fafc)',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '1rem' }}>Click or Drag & Drop image here</p>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Supports JPG, PNG, WEBP up to 5MB</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-secondary, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedImage.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{(selectedImage.size / 1024).toFixed(1)} KB</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  onClick={handleSearch} 
                  disabled={loading}
                  style={{
                    background: 'var(--primary-color, #2563eb)', color: '#fff',
                    border: 'none', padding: '6px 14px', borderRadius: '6px',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  {loading ? '🔍 Extracting Features...' : '🔍 Find Similar Products'}
                </button>
                <button 
                  onClick={handleReset}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                Matching Products ({results.results?.length || 0})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Similarity threshold &ge; {results.threshold_used}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {results.results?.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => { onClose(); navigate(`/products/${prod.slug || prod.id}`); }}
                  style={{
                    border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px',
                    padding: '0.75rem', cursor: 'pointer', background: 'var(--card-bg, #fff)',
                    transition: 'transform 0.2s', position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: '#10b981', color: '#fff', fontSize: '0.7rem',
                    fontWeight: 700, padding: '2px 6px', borderRadius: '4px'
                  }}>
                    {prod.similarity_score}% Match
                  </div>
                  <div style={{ width: '100%', height: '110px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.8rem' }}>📦</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prod.name}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color, #2563eb)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {formatPrice(prod.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Search History */}
        {!results && history.length > 0 && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Recent Visual Searches:</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              {history.map((h, i) => (
                <span key={i} style={{ fontSize: '0.75rem', background: 'var(--bg-secondary, #f1f5f9)', padding: '3px 8px', borderRadius: '6px' }}>
                  🔍 {h.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default VisualSearchModal;
