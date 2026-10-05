import React, { createContext, useState, useEffect, useContext } from 'react';
import { wishlistService } from '../services/wishlistService';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data.results || data);
    } catch (e) {
      console.error("Failed to load wishlist", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (productId) => {
    await wishlistService.toggleWishlist(productId);
    await fetchWishlist();
  };

  const isSaved = (productId) => {
    return wishlist.some(item => item.product?.id === productId || item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isSaved, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
