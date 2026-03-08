/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

import Loader from './components/Loader';

// A simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader color="#ffffff" size="65px" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
