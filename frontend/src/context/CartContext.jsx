import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';
import { Toast } from '../components/common/Toast';
import api from '../services/api';

export const CartContext = createContext();

const GUEST_CART_STORAGE_KEY = 'smartcart_guest_cart';

const getInitialGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading guest cart from localStorage', e);
  }
  return { items: [], total_price: '0.00', total_items: 0 };
};

const calculateTotals = (items) => {
  const totalItems = items.reduce((acc, item) => acc + (parseInt(item.quantity, 10) || 1), 0);
  const totalPrice = items.reduce((acc, item) => {
    const unitPrice = parseFloat(item.product?.current_price || item.product?.price || 0);
    const qty = parseInt(item.quantity, 10) || 1;
    return acc + (unitPrice * qty);
  }, 0);

  return {
    total_items: totalItems,
    total_price: totalPrice.toFixed(2),
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(() => (isAuthenticated ? { items: [], total_price: '0.00', total_items: 0 } : getInitialGuestCart()));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchCart = async () => {
    if (!isAuthenticated) {
      const guestCart = getInitialGuestCart();
      setCart(guestCart);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (e) {
      console.error("Failed to load user cart from server", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync guest cart when user logs in, or load guest cart when unauthenticated
  useEffect(() => {
    if (isAuthenticated) {
      const syncGuestCartToBackend = async () => {
        try {
          const guestCart = getInitialGuestCart();
          if (guestCart.items && guestCart.items.length > 0) {
            for (const item of guestCart.items) {
              const productId = item.product?.id || item.product_id;
              if (productId) {
                await cartService.addToCart(productId, item.quantity);
              }
            }
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          }
        } catch (err) {
          console.warn('Failed to merge guest cart to user account:', err);
        } finally {
          fetchCart();
        }
      };

      syncGuestCartToBackend();
    } else {
      setCart(getInitialGuestCart());
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    // 1. Authenticated User Flow
    if (isAuthenticated) {
      try {
        const updatedCart = await cartService.addToCart(productId, quantity);
        setCart(updatedCart);
        showToast(productData?.name ? `"${productData.name}" added to cart!` : 'Item added to cart!', 'success');
        return updatedCart;
      } catch (err) {
        console.error('Backend cart update failed, falling back to local session', err);
      }
    }

    // 2. Guest User Flow (or offline fallback)
    try {
      let product = productData;
      if (!product) {
        // Fetch product info if not provided in caller
        const res = await api.get(`/products/${productId}/`);
        product = res.data;
      }

      const currentGuestCart = getInitialGuestCart();
      const existingItemIndex = currentGuestCart.items.findIndex(
        (it) => (it.product?.id || it.product_id) === productId
      );

      let updatedItems = [...currentGuestCart.items];

      if (existingItemIndex > -1) {
        const existing = updatedItems[existingItemIndex];
        const newQty = (existing.quantity || 1) + quantity;
        const unitPrice = parseFloat(product.current_price || product.price || 0);
        updatedItems[existingItemIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: (unitPrice * newQty).toFixed(2),
        };
      } else {
        const unitPrice = parseFloat(product.current_price || product.price || 0);
        const newItem = {
          id: `guest_${product.id}_${Date.now()}`,
          product_id: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            current_price: product.current_price || product.price,
            discount_price: product.discount_price,
            images: product.images || [],
            stock: product.stock,
            is_in_stock: product.is_in_stock !== false,
            category: product.category,
            category_details: product.category_details,
          },
          quantity,
          subtotal: (unitPrice * quantity).toFixed(2),
        };
        updatedItems.push(newItem);
      }

      const totals = calculateTotals(updatedItems);
      const newCart = {
        items: updatedItems,
        total_items: totals.total_items,
        total_price: totals.total_price,
      };

      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(newCart));
      setCart(newCart);
      showToast(product?.name ? `"${product.name}" added to cart!` : 'Item added to cart!', 'success');
      return newCart;
    } catch (e) {
      console.error('Failed to add to guest cart:', e);
      showToast('Could not add item to cart. Please try again.', 'error');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return await removeItem(cartItemId);
    }

    if (isAuthenticated && !String(cartItemId).startsWith('guest_')) {
      try {
        await cartService.updateItemQuantity(cartItemId, quantity);
        await fetchCart();
        return;
      } catch (e) {
        console.error('Failed to update item on server', e);
      }
    }

    // Guest update
    const currentGuestCart = getInitialGuestCart();
    const updatedItems = currentGuestCart.items.map((it) => {
      if (it.id === cartItemId) {
        const unitPrice = parseFloat(it.product?.current_price || it.product?.price || 0);
        return {
          ...it,
          quantity,
          subtotal: (unitPrice * quantity).toFixed(2),
        };
      }
      return it;
    });

    const totals = calculateTotals(updatedItems);
    const newCart = {
      items: updatedItems,
      total_items: totals.total_items,
      total_price: totals.total_price,
    };

    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(newCart));
    setCart(newCart);
  };

  const removeItem = async (cartItemId) => {
    if (isAuthenticated && !String(cartItemId).startsWith('guest_')) {
      try {
        await cartService.removeItem(cartItemId);
        await fetchCart();
        return;
      } catch (e) {
        console.error('Failed to remove item on server', e);
      }
    }

    // Guest remove
    const currentGuestCart = getInitialGuestCart();
    const updatedItems = currentGuestCart.items.filter((it) => it.id !== cartItemId);
    const totals = calculateTotals(updatedItems);
    const newCart = {
      items: updatedItems,
      total_items: totals.total_items,
      total_price: totals.total_price,
    };

    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(newCart));
    setCart(newCart);
    showToast('Item removed from cart', 'info');
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (e) {
        console.error('Failed to clear server cart', e);
      }
    }
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    setCart({ items: [], total_price: '0.00', total_items: 0 });
    showToast('Cart cleared', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        showToast,
      }}
    >
      {children}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </CartContext.Provider>
  );
};

