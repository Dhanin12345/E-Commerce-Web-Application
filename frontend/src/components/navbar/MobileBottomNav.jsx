import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();

  const totalItems = cart?.total_items || 0;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Catalog', path: '/products', icon: Grid },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: totalItems },
    { label: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav
      className="show-on-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--mobile-nav-height, 60px)',
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.25)',
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: isActive ? 'var(--primary-400)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              position: 'relative',
              padding: '0.35rem 0.5rem',
              flex: 1,
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    backgroundColor: 'var(--primary-500)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
