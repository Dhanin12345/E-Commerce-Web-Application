import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Search, Loader2, Sparkles, X, Volume2 } from 'lucide-react';

export const VoiceSearchModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState('listening'); // 'listening' | 'processing' | 'searching' | 'results'
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const suggestedQueries = [
    'Show gaming laptops under ₹70,000',
    'Best wireless noise cancelling headphones',
    'Ergonomic mouse with dual Bluetooth',
    'Smart watch with health telemetry',
  ];

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    setStatus('listening');
    setTranscript('');
    setErrorMsg('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const current = event.results[0][0].transcript;
          setTranscript(current);
          if (event.results[0].isFinal) {
            handleCompleteSpeech(current);
          }
        };

        recognition.onerror = (e) => {
          console.warn('SpeechRecognition error:', e.error);
          if (e.error === 'not-allowed') {
            setErrorMsg('Microphone access was denied. You can click any sample voice prompt below:');
          }
        };

        recognition.onend = () => {
          if (status === 'listening' && !transcript) {
            // Keep alive or let user select prompt
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn(err);
      }
    } else {
      setErrorMsg('Voice input API not active in this browser. Click a prompt below to simulate:');
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isOpen]);

  const handleCompleteSpeech = (text) => {
    if (!text || !text.trim()) return;
    setStatus('processing');
    setTimeout(() => {
      setStatus('searching');
      setTimeout(() => {
        onClose();
        navigate(`/search?q=${encodeURIComponent(text.trim())}`);
      }, 700);
    }, 600);
  };

  const handleSampleClick = (query) => {
    setTranscript(query);
    handleCompleteSpeech(query);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), var(--shadow-glow)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Close voice search"
        >
          <X size={20} />
        </button>

        {/* State Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {status === 'listening' && (
            <span className="live-indicator">
              <span className="live-dot" style={{ backgroundColor: '#ef4444' }} />
              Listening...
            </span>
          )}
          {status === 'processing' && (
            <span className="live-indicator" style={{ color: '#0ea5e9' }}>
              <Loader2 size={14} className="animate-spin" />
              Processing audio...
            </span>
          )}
          {status === 'searching' && (
            <span className="live-indicator" style={{ color: 'var(--primary-400)' }}>
              <Search size={14} />
              Searching catalog...
            </span>
          )}
        </div>

        {/* Microphone Pulse Circle */}
        <div
          style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background:
              status === 'listening'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-500) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow:
              status === 'listening'
                ? '0 0 30px rgba(239, 68, 68, 0.5)'
                : '0 0 30px rgba(99, 102, 241, 0.5)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <Mic size={42} />
        </div>

        {/* Transcript or Guide Text */}
        <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {transcript ? (
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', fontStyle: 'italic' }}>
              "{transcript}"
            </p>
          ) : (
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              Speak naturally, e.g. <span style={{ color: 'var(--text-main)' }}>"Show wireless headphones..."</span>
            </p>
          )}
        </div>

        {errorMsg && (
          <p style={{ fontSize: '0.8rem', color: 'var(--warning-500)', lineHeight: 1.4 }}>
            {errorMsg}
          </p>
        )}

        {/* Suggested Quick Prompts */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
            Try Saying or Tap to Search:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(q)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-400)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <Sparkles size={14} color="var(--primary-400)" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};

export default VoiceSearchModal;
