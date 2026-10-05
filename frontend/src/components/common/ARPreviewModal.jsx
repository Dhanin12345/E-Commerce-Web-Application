import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';

const ARPreviewModal = ({ isOpen, onClose, product }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [placementMode, setPlacementMode] = useState('table');
  const [arActive, setArActive] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  if (!isOpen || !product) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div style={{
        background: '#0f172a', color: '#f8fafc',
        borderRadius: '20px', maxWidth: '800px', width: '100%',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
        border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.75rem', borderBottom: '1px solid #1e293b'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>🥽</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                AR 3D Interactive Virtual Placement
              </h2>
              <span style={{ fontSize: '0.7rem', background: '#8b5cf6', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                WebXR Ready
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Preview {product.name} in true-to-scale 3D before purchasing.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* 3D Viewport Canvas Simulation */}
        <div style={{
          position: 'relative', height: '420px', background: arActive 
            ? 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' 
            : 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {/* Virtual Grid Floor */}
          <div style={{
            position: 'absolute', bottom: '0', width: '100%', height: '180px',
            background: 'linear-gradient(transparent, rgba(59, 130, 246, 0.08))',
            borderTop: '1px dashed rgba(59, 130, 246, 0.2)',
            transform: 'perspective(400px) rotateX(60deg)', pointerEvents: 'none'
          }} />

          {/* Simulated 3D Model Render */}
          <div style={{
            transform: `rotateY(${rotation}deg) scale(${scale})`,
            transition: 'transform 0.1s ease',
            filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))',
            display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1
          }}>
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0].image} 
                alt={product.name}
                style={{ maxHeight: '220px', maxWidth: '280px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ fontSize: '6rem' }}>📦</div>
            )}
            <div style={{
              marginTop: '1rem', background: 'rgba(0,0,0,0.6)',
              padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem',
              color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              Angle: {rotation}° | Surface: {placementMode.toUpperCase()} | Scale: {scale.toFixed(1)}x
            </div>
          </div>

          {/* AR Camera Overlay Toggle */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
            <button
              onClick={() => setArActive(!arActive)}
              style={{
                background: arActive ? '#10b981' : 'rgba(255,255,255,0.15)',
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '20px',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📷 {arActive ? 'AR Camera Active' : 'Simulate Camera AR'}
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{
          padding: '1.25rem 1.75rem', background: '#090d16',
          borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
        }}>
          {/* 360 Rotation Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rotate:</span>
            <input 
              type="range" min="0" max="360" value={rotation} 
              onChange={(e) => setRotation(Number(e.target.value))}
              style={{ width: '120px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rotation}°</span>
          </div>

          {/* Scale Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Scale:</span>
            <input 
              type="range" min="0.7" max="1.5" step="0.1" value={scale} 
              onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: '90px', cursor: 'pointer' }}
            />
          </div>

          {/* Placement Selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['table', 'floor', 'wall'].map((m) => (
              <button
                key={m}
                onClick={() => setPlacementMode(m)}
                style={{
                  background: placementMode === m ? '#3b82f6' : '#1e293b',
                  color: '#fff', border: 'none', padding: '4px 10px',
                  borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Price & Add to Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
              {formatPrice(product.price)}
            </span>
            <button
              onClick={() => {
                addToCart(product.id, 1);
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff',
                border: 'none', padding: '8px 18px', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARPreviewModal;
