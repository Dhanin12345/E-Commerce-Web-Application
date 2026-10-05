import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/navbar/Navbar';
import { AIAssistantWidget } from './components/common/AIAssistantWidget';
import { MobileBottomNav } from './components/navbar/MobileBottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { AppRoutes } from './routes/AppRoutes';

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Global Offline Network Alert */}
      <OfflineBanner />

      {/* Primary Navigation */}
      {!isAdminRoute && <Navbar />}

      {/* Main Page Content */}
      <div style={{ flex: 1, paddingBottom: !isAdminRoute ? '60px' : 0 }}>
        <AppRoutes />
      </div>

      {/* AI Assistant Floating Widget */}
      {!isAdminRoute && <AIAssistantWidget />}

      {/* Mobile Sticky Bottom Navigation */}
      {!isAdminRoute && <MobileBottomNav />}

      {/* Global Enterprise Footer */}
      {!isAdminRoute && (
        <footer
          style={{
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            padding: '3rem 1.5rem',
            marginTop: 'auto',
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Smart<span style={{ color: 'var(--primary-400)' }}>Cart</span>
              </span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', maxWidth: '420px' }}>
                Intelligent, responsive enterprise commerce with L1–L10 architecture, AI recommendations, and multi-warehouse telemetry.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <a href="/support">Support Center</a>
              <a href="/privacy">Privacy & GDPR</a>
              <a href="/enterprise">Enterprise Portal</a>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} SmartCart Platform Inc. All rights reserved.
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <AppLayout />
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
