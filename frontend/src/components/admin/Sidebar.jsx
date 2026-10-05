import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  ShoppingCart,
  Users,
  Store,
  CreditCard,
  Ticket,
  MessageSquare,
  RotateCcw,
  BarChart3,
  Cpu,
  Bell,
  ShieldAlert,
  Activity,
  ToggleLeft,
  Settings,
  ArrowLeft,
} from 'lucide-react';

export const Sidebar = () => {
  const navSections = [
    {
      title: 'Commerce Core',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/products', label: 'Products', icon: Package },
        { to: '/admin/categories', label: 'Categories', icon: Layers },
        { to: '/admin/inventory', label: 'Inventory', icon: Archive },
        { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/admin/users', label: 'Customers', icon: Users },
      ],
    },
    {
      title: 'Marketplace & Finance',
      items: [
        { to: '/admin?tab=marketplace', label: 'Sellers', icon: Store },
        { to: '/admin/coupons', label: 'Promotions', icon: Ticket },
        { to: '/admin?tab=returns', label: 'Returns', icon: RotateCcw },
        { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Enterprise Architecture (L6–L10)',
      items: [
        { to: '/enterprise', label: 'Enterprise Command', icon: Cpu },
        { to: '/admin?tab=system_health', label: 'System Health', icon: Activity },
        { to: '/admin?tab=security', label: 'Security & Audit', icon: ShieldAlert },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
      }}
    >
      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Smart<span style={{ color: 'var(--primary-400)' }}>Cart</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 600 }}>Enterprise Console L1–L10</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto' }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.75rem', display: 'block', marginBottom: '0.4rem' }}>
              {sec.title}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                      textDecoration: 'none',
                    })}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            padding: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Storefront
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
