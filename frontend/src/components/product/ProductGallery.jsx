import React, { useState, useEffect } from 'react';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000${url}`;
};

export const ProductGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]?.image || null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]?.image || null);
      setImageError(false);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          backgroundColor: '#1e293b',
        }}
      >
        No Image Available
      </div>
    );
  }

  const rawActiveSrc = selectedImage || images[0]?.image;
  const activeSrc = resolveImageUrl(rawActiveSrc);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Featured Big Image */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          height: '460px',
          overflow: 'hidden',
          backgroundColor: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {activeSrc && !imageError ? (
          <img
            src={activeSrc}
            alt="Product showcase"
            onError={() => setImageError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SmartCart Tech</div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {images.map((img, idx) => {
            const thumbUrl = resolveImageUrl(img.image);
            const isSelected = rawActiveSrc === img.image;
            return (
              <button
                key={img.id || idx}
                onClick={() => {
                  setSelectedImage(img.image);
                  setImageError(false);
                }}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--primary-500)' : '2px solid transparent',
                  background: '#1e293b',
                  flexShrink: 0,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <img
                  src={thumbUrl}
                  alt={img.alt_text || 'Thumbnail'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

