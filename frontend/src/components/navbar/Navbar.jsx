import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { CartIcon } from './CartIcon';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCompare } from '../../context/CompareContext';
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
  Scale,
  Headphones,
  Cpu,
  Bell,
  Grid,
} from 'lucide-react';
import NotificationDrawer from '../common/NotificationDrawer';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currencyCode, setCurrency, availableCurrencies } = useCurrency();
  const { lang, setLang, t } = useLanguage();
  const { compareItems } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-500) 100%)',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShoppingBag size={20} />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Smart<span style={{ color: 'var(--primary-400)' }}>Cart</span>
          </span>
        </Link>

        {/* Categories Link (Desktop) */}
        <Link
          to="/products"
          className="hide-on-mobile"
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textDecoration: 'none',
          }}
        >
          <Grid size={15} color="var(--primary-400)" />
          <span>Categories</span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div className="hide-on-mobile" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchBar />
        </div>

        {/* Controls: Currency, Language, Theme */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Currency Switcher */}
          <select
            value={currencyCode}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.4rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {availableCurrencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>

          {/* Language Switcher */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.4rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="de">Deutsch</option>
          </select>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Compare Products Badge */}
          <Link
            to="/compare"
            title="Product Comparison"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              textDecoration: 'none',
            }}
          >
            <Scale size={19} />
            {compareItems.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--accent-500)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {compareItems.length}
              </span>
            )}
          </Link>

          {/* Support Ticket Link */}
          <Link
            to="/support"
            title="Customer Support"
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              textDecoration: 'none',
            }}
          >
            <Headphones size={19} />
          </Link>

          {/* Notifications Center Bell */}
          <button
            onClick={() => setNotificationOpen(true)}
            title="Notifications"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Open notifications"
          >
            <Bell size={19} />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: 'var(--primary-500)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '800',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
          </button>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link
              to="/wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
              }}
              title="Wishlist"
            >
              <Heart size={20} />
            </Link>
          )}

          {/* SmartCart X Enterprise Control Center */}
          <Link
            to="/enterprise"
            title="SmartCart X Enterprise Architecture Portal"
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
              color: '#ffffff',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              fontSize: '0.78rem',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <Cpu size={15} color="#38bdf8" />
            <span>Enterprise X</span>
          </Link>

          <CartIcon />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: 'var(--primary-300)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={15} />
                  <span className="hide-on-mobile">Admin</span>
                </Link>
              )}
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', textDecoration: 'none' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#ffffff',
                  }}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary hide-on-mobile" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
            className="show-on-mobile"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </header>
  );
};
