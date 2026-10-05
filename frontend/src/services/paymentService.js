import api from './api';

export const paymentService = {
  async processPayment(paymentData) {
    const response = await api.post('/payments/process/', paymentData);
    return response.data;
  },

  async getPaymentDetails(orderNumber) {
    const response = await api.get(`/payments/${orderNumber}/`);
    return response.data;
  },
};
