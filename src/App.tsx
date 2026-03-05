/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import CartPage from './pages/CartPage';
import UserProfilePage from './pages/UserProfilePage';
import CheckoutPage from './pages/CheckoutPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/store/category/:category" element={<StorePage />} />
      <Route path="/store/category/:category/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route 
        path="/signin/*" 
        element={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <SignIn 
              routing="path" 
              path="/signin" 
              signUpUrl="/signup"
              afterSignInUrl="/store"
              redirectUrl="/store"
            />
          </div>
        } 
      />
      <Route 
        path="/signup/*" 
        element={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <SignUp 
              routing="path" 
              path="/signup" 
              signInUrl="/signin"
              afterSignUpUrl="/store"
              redirectUrl="/store"
            />
          </div>
        } 
      />
      <Route path="/ASTRA/store.html" element={<StorePage />} /> {/* Handle legacy link from HTML */}
    </Routes>
  );
}
