import api from './api';

export const reviewService = {
  async getProductReviews(productId) {
    const response = await api.get('/reviews/', { params: { product: productId } });
    return response.data;
  },

  async submitReview(reviewData) {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  },
};
