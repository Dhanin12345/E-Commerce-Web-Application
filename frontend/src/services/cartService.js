import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart/');
    return response.data;
  },

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/cart/items/', { product_id: productId, quantity });
    return response.data;
  },

  async updateItemQuantity(cartItemId, quantity) {
    const response = await api.patch(`/cart/items/${cartItemId}/`, { quantity });
    return response.data;
  },

  async removeItem(cartItemId) {
    const response = await api.delete(`/cart/items/${cartItemId}/`);
    return response.data;
  },

  async clearCart() {
    const response = await api.post('/cart/clear/');
    return response.data;
  },
};
