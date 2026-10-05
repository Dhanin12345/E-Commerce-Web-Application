import React, { useState, useEffect } from 'react';
import nextgenService from '../services/nextgenService';

const PrivacyCenterPage = () => {
  const [preferences, setPreferences] = useState({
    analytics_consent: true,
    marketing_emails: true,
    personalized_recommendations: true,
    data_retention_days: 365
  });
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const data = await nextgenService.getPrivacyPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load privacy preferences:', err);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await nextgenService.updatePrivacyPreferences(preferences);
      setSavedMsg('Your privacy choices have been successfully updated!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      alert('Failed to save privacy settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    setExportLoading(true);
    nextgenService.exportUserData(format);
    setTimeout(() => setExportLoading(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{
        background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>🛡️</span>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Customer Data Privacy & Transparency Center</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
              GDPR & CCPA Compliant Self-Service Data Governance & Export
            </p>
          </div>
        </div>

        {savedMsg && (
          <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ✅ {savedMsg}
          </div>
        )}

        {/* Section 1: Consent Preferences */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Data Collection & Usage Consent</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Personalized Recommendations & AI Copilot</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Allow AI models to customize catalog feeds based on your browsing patterns.</div>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.personalized_recommendations} 
              onChange={() => handleToggle('personalized_recommendations')}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Product & Performance Analytics</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Help us optimize site responsiveness, search speed, and checkout flow.</div>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.analytics_consent} 
              onChange={() => handleToggle('analytics_consent')}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Price Alerts & Restock Notifications</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Receive instant transactional emails when items on your wishlist go on sale.</div>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.marketing_emails} 
              onChange={() => handleToggle('marketing_emails')}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              alignSelf: 'flex-start', background: 'var(--primary-color, #2563eb)', color: '#fff',
              border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {loading ? 'Saving Changes...' : 'Save Privacy Preferences'}
          </button>
        </div>

        {/* Section 2: Data Portability & Export (Requirement 33) */}
        <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Data Portability (Export)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', marginBottom: '1rem' }}>
            Request an immutable copy of your account profile, order ledger, submitted reviews, and wishlist in machine-readable format.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              style={{
                background: '#0f172a', color: '#fff', border: 'none',
                padding: '10px 18px', borderRadius: '8px', fontWeight: 600,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📥 Download Data Archive (JSON)
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              style={{
                background: '#e2e8f0', color: '#1e293b', border: 'none',
                padding: '10px 18px', borderRadius: '8px', fontWeight: 600,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📊 Export Ledger (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCenterPage;
