import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Storefront Pages
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { Products } from '../pages/Products';
import { ProductDetails } from '../pages/ProductDetails';
import { SearchResults } from '../pages/SearchResults';
import { Cart } from '../pages/Cart';
import { Wishlist } from '../pages/Wishlist';
import { Checkout } from '../pages/Checkout';
import { Payment } from '../pages/Payment';
import { OrderSuccess } from '../pages/OrderSuccess';
import { OrderTracking } from '../pages/OrderTracking';
import { OrderHistory } from '../pages/OrderHistory';
import { Profile } from '../pages/Profile';
import { Compare } from '../pages/Compare';
import { Support } from '../pages/Support';
import CollectionsPage from '../pages/CollectionsPage';
import SubscriptionsPage from '../pages/SubscriptionsPage';
import PrivacyCenterPage from '../pages/PrivacyCenterPage';
import { NotFound } from '../pages/NotFound';
import { EnterpriseControlCenter } from '../admin/EnterpriseControlCenter';

// Admin Views
import { Dashboard as AdminDashboard } from '../admin/Dashboard';
import { Products as AdminProducts } from '../admin/Products';
import { AddProduct as AdminAddProduct } from '../admin/AddProduct';
import { EditProduct as AdminEditProduct } from '../admin/EditProduct';
import { Categories as AdminCategories } from '../admin/Categories';
import { Inventory as AdminInventory } from '../admin/Inventory';
import { Orders as AdminOrders } from '../admin/Orders';
import { Users as AdminUsers } from '../admin/Users';
import { Coupons as AdminCoupons } from '../admin/Coupons';
import { Reviews as AdminReviews } from '../admin/Reviews';
import { Analytics as AdminAnalytics } from '../admin/Analytics';
import { Settings as AdminSettings } from '../admin/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/support" element={<Support />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/privacy" element={<PrivacyCenterPage />} />
      <Route path="/enterprise" element={<EnterpriseControlCenter />} />

      {/* Authenticated Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderNumber/track" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
      </Route>


      {/* Admin Operations Console Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminAddProduct />} />
        <Route path="products/edit/:id" element={<AdminEditProduct />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="enterprise" element={<EnterpriseControlCenter />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
