import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(params);
      setProducts(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    params,
    setParams,
    refetch: fetchProducts,
  };
};
