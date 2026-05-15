import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import LoginBuyer from './pages/LoginBuyer';
import LoginSeller from './pages/LoginSeller';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicStorefront from './pages/PublicStorefront';
import Checkout from './pages/Checkout';

// Dashboard pages
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderTracking from './pages/OrderTracking';
import StoreBuilder from './pages/StoreBuilder';
import CardGenerator from './pages/CardGenerator';
import Analytics from './pages/Analytics';
import SellerSettings from './pages/SellerSettings';

// Layout components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// ── Role-based dashboard selector ─────────────────────────────────────────────
const DashboardSelector = () => {
  const userStr = localStorage.getItem('user');
  let user = {};
  try { user = JSON.parse(userStr || '{}'); } catch (e) { user = {}; }
  
  switch (user.role) {
    case 'seller': return <Navigate to="/seller/dashboard" replace />;
    case 'agent':  return <PublicPage><AgentDashboard /></PublicPage>;
    case 'buyer':
    default:       return <PublicPage><BuyerDashboard /></PublicPage>;
  }
};

// ── Public layout wrapper ──────────────────────────────────────────────────────
const PublicPage = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

// ── Seller layout wrapper ──────────────────────────────────────────────────────
const SellerPage = ({ children, roles = ['seller'] }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

// ── Orders Wrapper (Role-based layout) ─────────────────────────────────────────
const OrdersWrapper = () => {
  const userStr = localStorage.getItem('user');
  let user = {};
  try { user = JSON.parse(userStr || '{}'); } catch (e) { user = {}; }
  
  if (user.role === 'seller') {
    return (
      <ProtectedRoute allowedRoles={['seller']}>
        <DashboardLayout><OrderTracking /></DashboardLayout>
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute>
      <PublicPage><OrderTracking /></PublicPage>
    </ProtectedRoute>
  );
};

// ── App Router ────────────────────────────────────────────────────────────────
function App() {
  const userStr = localStorage.getItem('user');
  let user = {};
  try { user = JSON.parse(userStr || '{}'); } catch (e) { user = {}; }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/"             element={<PublicPage><Home /></PublicPage>} />
          <Route path="/login/buyer"  element={<PublicPage><LoginBuyer /></PublicPage>} />
          <Route path="/login/seller" element={<PublicPage><LoginSeller /></PublicPage>} />
          <Route path="/register"     element={<PublicPage><Register /></PublicPage>} />
          <Route path="/forgot-password" element={<PublicPage><ForgotPassword /></PublicPage>} />
          <Route path="/reset-password/:token" element={<PublicPage><ResetPassword /></PublicPage>} />
          <Route path="/reset-password" element={<PublicPage><ResetPassword /></PublicPage>} />
          <Route path="/store/:slug"  element={<PublicStorefront />} />
          <Route path="/checkout"     element={<ProtectedRoute><PublicPage><Checkout /></PublicPage></ProtectedRoute>} />

          {/* ── Universal Dashboard (role-based) ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          } />

          {/* ── Seller Routes (all inside DashboardLayout) ── */}
          <Route path="/seller/dashboard" element={<SellerPage><SellerDashboard /></SellerPage>} />
          <Route path="/products/manage"  element={<SellerPage><ProductManagement /></SellerPage>} />
          <Route path="/store-builder"    element={<SellerPage><StoreBuilder /></SellerPage>} />
          <Route path="/card-generator"   element={<SellerPage><CardGenerator /></SellerPage>} />
          <Route path="/analytics"        element={<SellerPage><Analytics /></SellerPage>} />
          <Route path="/seller/settings"  element={<SellerPage><SellerSettings /></SellerPage>} />

          {/* ── Orders (role-based layout) ── */}
          <Route path="/orders/tracking" element={<OrdersWrapper />} />
          
          {/* ── Admin Routes ── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? (
                <PublicPage><AdminDashboard /></PublicPage>
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;