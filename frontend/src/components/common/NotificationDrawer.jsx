import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Package,
  CreditCard,
  Truck,
  AlertTriangle,
  Tag,
  Cpu,
  Settings,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Order Dispatched from Hub A',
      message: 'Your order SMART-ORD-9021 is now in transit with Express Courier.',
      category: 'Delivery',
      time: '12m ago',
      read: false,
      link: '/orders/SMART-ORD-9021/track',
    },
    {
      id: 'notif-2',
      title: 'Payment Confirmed',
      message: 'Payment of $1,299.00 authorized via 256-bit secure gateway.',
      category: 'Payments',
      time: '45m ago',
      read: false,
      link: '/orders',
    },
    {
      id: 'notif-3',
      title: 'Price Drop Alert',
      message: 'AuraSound Noise-Cancelling Headphones just dropped by $30.00!',
      category: 'Promotions',
      time: '2h ago',
      read: false,
      link: '/products',
    },
    {
      id: 'notif-4',
      title: 'Low Stock Telemetry',
      message: 'ErgoGlide Master Mouse has only 3 units left in Regional Hub.',
      category: 'Inventory',
      time: '5h ago',
      read: true,
      link: '/products',
    },
    {
      id: 'notif-5',
      title: 'System Telemetry Nominal',
      message: 'Event-driven message bus synced 1,420 events with zero latency lag.',
      category: 'System',
      time: '1d ago',
      read: true,
      link: '/enterprise',
    },
  ]);

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    orders: true,
    delivery: true,
    promotions: true,
    system: false,
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Orders': return <Package size={16} color="var(--primary-400)" />;
      case 'Payments': return <CreditCard size={16} color="var(--success-500)" />;
      case 'Delivery': return <Truck size={16} color="var(--accent-500)" />;
      case 'Inventory': return <AlertTriangle size={16} color="var(--warning-500)" />;
      case 'Promotions': return <Tag size={16} color="#ec4899" />;
      case 'System': return <Cpu size={16} color="#38bdf8" />;
      default: return <Bell size={16} color="var(--primary-400)" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = activeCategory === 'ALL'
    ? notifications
    : notifications.filter((n) => n.category.toUpperCase() === activeCategory.toUpperCase());

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(11, 15, 25, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          backgroundColor: '#111827',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          color: '#f8fafc',
          position: 'relative',
          zIndex: 1000000,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(17, 24, 39, 0.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={20} color="var(--primary-400)" />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--primary-500)',
                  color: '#ffffff',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setPreferencesOpen(!preferencesOpen)}
              title="Notification Settings"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Settings size={17} />
            </button>
            <button
              onClick={onClose}
              title="Close drawer"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preferences Toggle Sub-section */}
        {preferencesOpen && (
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#1e293b',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.5rem' }}>
              Notification Preferences
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {Object.keys(preferences).map((k) => (
                <label key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#cbd5e1' }}>
                  <span style={{ textTransform: 'capitalize' }}>{k} Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences[k]}
                    onChange={(e) => setPreferences({ ...preferences, [k]: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filter Chips & Mark All Read */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {['ALL', 'Orders', 'Delivery', 'Payments', 'Promotions', 'System'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: activeCategory === cat ? 'var(--primary-600)' : '#1e293b',
                  color: activeCategory === cat ? '#ffffff' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            style={{
              background: 'transparent',
              color: 'var(--primary-400)',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              No notifications in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.read ? '#1e293b' : 'rgba(79, 70, 229, 0.14)',
                  border: item.read ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(99, 102, 241, 0.35)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.22)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.read ? '#1e293b' : 'rgba(79, 70, 229, 0.14)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getCategoryIcon(item.category)}
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 700 }}>
                      {item.title}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {item.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0.5rem 0', lineHeight: 1.45 }}>
                  {item.message}
                </p>
                {item.link && (
                  <Link
                    to={item.link}
                    onClick={onClose}
                    style={{ fontSize: '0.78rem', color: 'var(--primary-400)', fontWeight: 600, display: 'inline-block' }}
                  >
                    View Details →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationDrawer;
