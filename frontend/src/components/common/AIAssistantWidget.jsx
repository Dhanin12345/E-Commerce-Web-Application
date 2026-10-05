import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, ShoppingCart, Loader2, ArrowRight, Scale, Mic, MicOff, Check } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';
import { useCompare } from '../../context/CompareContext';

export const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { addToCompare, isComparing } = useCompare();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your SmartCart AI Shopping Copilot. You can ask natural queries like *'Find a laptop for programming under $1500'* or *'Add the cheapest product to my wishlist'*!",
      products: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const query = messageText || input;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      products: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply = '';
      let prods = [];
      try {
        const copilotRes = await api.post('/nextgen/copilot/', { query });
        reply = copilotRes.data.reply;
        prods = copilotRes.data.products || [];
      } catch (e) {
        const res = await api.post('/products/assistant/', { message: query });
        reply = res.data.reply;
        prods = res.data.products || [];
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        products: prods,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I'm having a little trouble querying the inventory catalog right now. Please try again or browse our store catalog directly!",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          padding: '0.8rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: '700',
          fontSize: '0.92rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <Sparkles size={18} />
        <span>AI Shopping Assistant</span>
      </button>

      {/* Assistant Modal Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 110px)',
            backgroundColor: 'var(--bg-card-hover)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--primary-500)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  SmartCart AI
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--success-500)' }}>
                  ● Connected to Live Database
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      m.sender === 'user'
                        ? 'var(--primary-600)'
                        : 'rgba(255, 255, 255, 0.07)',
                    color: '#ffffff',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    borderBottomRightRadius: m.sender === 'user' ? '2px' : 'var(--radius-md)',
                    borderBottomLeftRadius: m.sender === 'assistant' ? '2px' : 'var(--radius-md)',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                  }}
                >
                  {m.text}
                </div>

                {/* Embedded Matching Products */}
                {m.products && m.products.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.65rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {m.products.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.7)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.6rem 0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <a
                            href={`/products/${p.id}`}
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              color: 'var(--text-main)',
                              textDecoration: 'none',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.name}
                          </a>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: '700' }}>
                            {formatPrice(p.price)} • {p.rating}★
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            onClick={() => (isComparing(p.id) ? null : addToCompare(p))}
                            style={{
                              background: isComparing(p.id) ? 'var(--accent-500)' : 'var(--bg-input)',
                              color: '#ffffff',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                            title="Compare"
                          >
                            <Scale size={13} />
                          </button>

                          <button
                            onClick={() => handleAddToCart(p)}
                            style={{
                              background: 'var(--primary-600)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <ShoppingCart size={13} />
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Searching catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: '0.4rem 0.8rem',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.1)',
            }}
          >
            {[
              'Find a laptop under ₹70,000',
              'Best noise cancelling headphones',
              'Ergonomic keyboard setup',
              'Compare top electronics',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Ask about products, specs, or ask AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.8rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />

            {/* Mic Voice Dictation Button */}
            <button
              type="button"
              onClick={() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  setInput('Find a laptop under ₹70,000');
                  return;
                }
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.onstart = () => setIsListening(true);
                recognition.onresult = (evt) => {
                  const speech = evt.results[0][0].transcript;
                  setInput(speech);
                  setIsListening(false);
                };
                recognition.onerror = () => setIsListening(false);
                recognition.onend = () => setIsListening(false);
                recognition.start();
              }}
              style={{
                background: isListening ? '#ef4444' : 'var(--bg-input)',
                color: isListening ? '#ffffff' : 'var(--primary-400)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={isListening ? 'Listening...' : 'Voice Dictation'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: 'var(--primary-500)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
