import api from './api';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist/');
    return response.data;
  },

  async toggleWishlist(productId) {
    const response = await api.post('/wishlist/toggle/', { product_id: productId });
    return response.data;
  },
};
