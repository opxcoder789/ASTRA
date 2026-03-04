/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/ASTRA/store.html" element={<StorePage />} /> {/* Handle legacy link from HTML */}
    </Routes>
  );
}
