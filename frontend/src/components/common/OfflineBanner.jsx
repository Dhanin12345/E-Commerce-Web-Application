import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.6rem 1.25rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isOffline ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
        color: '#ffffff',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        fontSize: '0.84rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
      }}
    >
      {isOffline ? (
        <>
          <WifiOff size={16} />
          <span>You're offline. Some actions and live telemetry may be unavailable.</span>
        </>
      ) : (
        <>
          <Wifi size={16} />
          <span>Connection restored. Live sync active.</span>
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
