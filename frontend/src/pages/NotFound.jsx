import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { HelpCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '480px', width: '100%' }}>
        <HelpCircle size={56} color="var(--primary-400)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontSize: '3rem', color: '#ffffff', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">Return to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};
