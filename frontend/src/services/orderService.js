import api from './api';

export const orderService = {
  async getOrders() {
    const response = await api.get('/orders/');
    return response.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}/`);
    return response.data;
  },

  async getOrderTimeline(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}/timeline/`);
    return response.data;
  },

  async createOrder(orderPayload) {
    const response = await api.post('/orders/create/', orderPayload);
    return response.data;
  },
};
