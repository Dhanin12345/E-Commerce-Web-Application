import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { Printer, Download, X, CheckCircle, FileText, Loader2 } from 'lucide-react';

export const DigitalInvoiceModal = ({ orderNumber, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/orders/${orderNumber}/invoice/`);
        setInvoice(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (orderNumber) {
      fetchInvoice();
    }
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Action Toolbar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
            <FileText size={18} color="#4f46e5" />
            <span>Digital Tax Invoice</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              Generating digital invoice...
            </div>
          ) : !invoice ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
              Failed to load invoice details.
            </div>
          ) : (
            <div>
              {/* Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e1b4b', margin: 0 }}>
                    Smart<span style={{ color: '#4f46e5' }}>Cart</span>
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    {invoice.company.name}<br />
                    {invoice.company.address}<br />
                    Tax ID: {invoice.company.tax_id} | {invoice.company.support_email}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
                    {invoice.invoice_number}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Date: {invoice.created_date}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                      }}
                    >
                      ● {invoice.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Section */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Billed To
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                    {invoice.customer_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{invoice.customer_email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Shipping Destination
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                    {invoice.shipping_address}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                      <td style={{ padding: '1rem 0', fontWeight: '600', color: '#1e293b' }}>
                        {item.product_name}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#475569' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#475569' }}>
                        {formatPrice(item.unit_price)}
                      </td>
                      <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatPrice(invoice.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Estimated Tax (8%):</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatPrice(invoice.tax_amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Shipping:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>
                      {invoice.shipping_cost > 0 ? formatPrice(invoice.shipping_cost) : 'FREE'}
                    </span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Discount:</span>
                      <span style={{ fontWeight: '600' }}>-{formatPrice(invoice.discount_amount)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      borderTop: '2px solid #e2e8f0',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.2rem',
                      fontWeight: '900',
                      color: '#4f46e5',
                    }}
                  >
                    <span>Total Paid:</span>
                    <span>{formatPrice(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div
                style={{
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '1.25rem',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Thank you for shopping with SmartCart! This is a computer-generated tax invoice and requires no physical signature.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
