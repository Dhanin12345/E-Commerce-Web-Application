export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', label: 'Credit or Debit Card' },
  { id: 'PAYPAL', label: 'PayPal' },
  { id: 'COD', label: 'Cash on Delivery' },
];
