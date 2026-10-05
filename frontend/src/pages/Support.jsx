import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  Headphones,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  X,
} from 'lucide-react';

export const Support = () => {
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'ORDER',
    priority: 'MEDIUM',
    initial_message: '',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets/');
      setTickets(res.data.results || res.data || []);
      if (activeTicket) {
        const updated = (res.data.results || res.data).find((t) => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.initial_message) return;

    try {
      await api.post('/support/tickets/', formData);
      setModalOpen(false);
      setFormData({ subject: '', category: 'ORDER', priority: 'MEDIUM', initial_message: '' });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    try {
      setSendingReply(true);
      await api.post(`/support/tickets/${activeTicket.id}/messages/`, { message: replyMessage });
      setReplyMessage('');
      // Refresh current ticket
      const res = await api.get(`/support/tickets/${activeTicket.id}/`);
      setActiveTicket(res.data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    try {
      await api.patch(`/support/tickets/${activeTicket.id}/status/`, { status: 'RESOLVED' });
      const res = await api.get(`/support/tickets/${activeTicket.id}/`);
      setActiveTicket(res.data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <Headphones size={48} color="var(--primary-400)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Customer Support Center</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Please log in to your account to open support tickets, view shipment resolutions, and chat with agents.
        </p>
        <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Support & Help Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Track inquiries, delivery assistance, warranty claims, and order resolutions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={18} />
          Create Support Ticket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '360px 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Ticket List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                border: '1px solid var(--border-color)',
              }}
            >
              <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                No Support Tickets
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You don't have any open inquiries. Click "Create Support Ticket" if you need assistance.
              </p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                style={{
                  backgroundColor:
                    activeTicket?.id === t.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  border:
                    activeTicket?.id === t.id
                      ? '1px solid var(--primary-500)'
                      : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {t.ticket_number}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor:
                        t.status === 'OPEN'
                          ? 'rgba(99, 102, 241, 0.2)'
                          : t.status === 'RESOLVED'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        t.status === 'OPEN'
                          ? 'var(--primary-300)'
                          : t.status === 'RESOLVED'
                          ? 'var(--success-500)'
                          : 'var(--warning-500)',
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {t.subject}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Category: {t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Conversation Thread Panel */}
        {activeTicket && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.1)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--primary-400)' }}>
                    {activeTicket.ticket_number}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Priority: {activeTicket.priority}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {activeTicket.subject}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeTicket.status !== 'RESOLVED' && (
                  <button
                    onClick={handleCloseTicket}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => setActiveTicket(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {activeTicket.messages?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.is_admin_reply ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem',
                      textAlign: m.is_admin_reply ? 'left' : 'right',
                    }}
                  >
                    {m.is_admin_reply ? '🎧 Support Agent' : m.sender_name} •{' '}
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    style={{
                      backgroundColor: m.is_admin_reply
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'var(--primary-600)',
                      color: '#ffffff',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      lineHeight: '1.45',
                    }}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {activeTicket.status !== 'RESOLVED' ? (
              <form
                onSubmit={handleSendReply}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Type your response to support..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 1rem',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: 'var(--success-500)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle size={16} /> This ticket has been marked as resolved.
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Open Support Ticket</h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question about order tracking or delivery delay"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.9rem',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.9rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="ORDER">Order & Delivery</option>
                    <option value="PAYMENT">Payment & Refund</option>
                    <option value="PRODUCT">Product Inquiries</option>
                    <option value="ACCOUNT">Account & Security</option>
                    <option value="GENERAL">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.9rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Detailed Description
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={formData.initial_message}
                  onChange={(e) => setFormData({ ...formData, initial_message: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.9rem',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
