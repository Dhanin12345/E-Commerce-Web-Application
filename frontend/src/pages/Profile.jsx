import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/common/Button';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Award,
  Gift,
  Headphones,
  Scale,
  CheckCircle,
  Copy,
} from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [redeemedCoupon, setRedeemedCoupon] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = async () => {
    try {
      const res = await api.get('/loyalty/me/');
      setLoyalty(res.data);
    } catch (err) {
      console.warn('Loyalty info unavailable', err);
    }
  };

  useEffect(() => {
    api.get('/users/profile/').then((res) => setProfile(res.data)).catch(console.error);
    api.get('/users/addresses/').then((res) => setAddresses(res.data.results || res.data)).catch(console.error);
    fetchLoyalty();
  }, []);

  const handleRedeemPoints = async () => {
    try {
      setRedeeming(true);
      const res = await api.post('/loyalty/redeem/', { points: 100 });
      setRedeemedCoupon(res.data);
      fetchLoyalty();
    } catch (err) {
      alert(err.response?.data?.error || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '880px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Account Profile</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage your personal details, rewards, and addresses</span>
        </div>
        <Button variant="danger" size="sm" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </Button>
      </div>

      {/* Navigation Quick Access Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <Link to="/orders" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>
            <Package size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>My Orders</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>History & tracking</span>
          </div>
        </Link>

        <Link to="/wishlist" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Heart size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Wishlist</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saved products</span>
          </div>
        </Link>

        <Link to="/support" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-500)' }}>
            <Headphones size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Help Desk</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Support tickets</span>
          </div>
        </Link>

        <Link to="/compare" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-500)' }}>
            <Scale size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Compare</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spec matrices</span>
          </div>
        </Link>

        {/* Next-Gen: Subscriptions */}
        <Link to="/subscriptions" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7' }}>
            <Package size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Subscriptions</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subscribe & Save</span>
          </div>
        </Link>

        {/* Next-Gen: Privacy Center */}
        <Link to="/privacy" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Privacy Center</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Export & Settings</span>
          </div>
        </Link>
      </div>

      {/* SmartCart Loyalty & Reward Card (Feature 22) */}
      {loyalty && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  SmartCart VIP Rewards
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Tier: <strong style={{ color: 'var(--primary-300)' }}>{loyalty.tier}</strong>
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f59e0b' }}>
                {loyalty.points_balance} <span style={{ fontSize: '1rem', fontWeight: '600' }}>PTS</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cash Value: ~${loyalty.dollar_value} USD
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Earn points on every completed purchase and verified product review.
            </p>

            <button
              onClick={handleRedeemPoints}
              disabled={redeeming || loyalty.points_balance < 100}
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '0.5rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Gift size={16} />
              {redeeming ? 'Generating Code...' : 'Redeem 100 pts for $10 Off'}
            </button>
          </div>

          {redeemedCoupon && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--success-500)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={16} /> Voucher Generated!
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {redeemedCoupon.coupon_code}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(redeemedCoupon.coupon_code);
                  alert('Coupon code copied to clipboard!');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <Copy size={14} /> Copy Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* Personal Information */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</span>
            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.2rem' }}>
              {user?.first_name || profile?.first_name || 'SmartCart'} {user?.last_name || profile?.last_name || 'Customer'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username</span>
            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.2rem' }}>
              @{user?.username}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</span>
            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.2rem' }}>
              {user?.email || 'N/A'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</span>
            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.2rem' }}>
              {profile?.phone_number || '+1 (555) 482-9912'}
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Shipping Addresses</h3>
        {addresses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No saved delivery addresses on file yet. Addresses added during checkout will automatically appear here.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {addr.full_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {addr.street_address}<br />
                  {addr.city}, {addr.state} {addr.postal_code}<br />
                  {addr.country}
                </div>
                {addr.is_default && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: 'var(--primary-400)',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    DEFAULT
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
