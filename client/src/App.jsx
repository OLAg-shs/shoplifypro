import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import LoginBuyer from './pages/LoginBuyer';
import LoginSeller from './pages/LoginSeller';
import Register from './pages/Register';

// Dashboard pages
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AgentDashboard from './pages/AgentDashboard';
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  switch (user.role) {
    case 'seller': return <SellerDashboard />;
    case 'agent':  return <AgentDashboard />;
    case 'buyer':
    default:       return <BuyerDashboard />;
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

// ── App Router ────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/"             element={<PublicPage><Home /></PublicPage>} />
          <Route path="/login/buyer"  element={<PublicPage><LoginBuyer /></PublicPage>} />
          <Route path="/login/seller" element={<PublicPage><LoginSeller /></PublicPage>} />
          <Route path="/register"     element={<PublicPage><Register /></PublicPage>} />

          {/* ── Universal Dashboard (role-based) ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardSelector /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ── Seller Routes (all inside DashboardLayout) ── */}
          <Route path="/seller/dashboard" element={<SellerPage><SellerDashboard /></SellerPage>} />
          <Route path="/products/manage"  element={<SellerPage><ProductManagement /></SellerPage>} />
          <Route path="/store-builder"    element={<SellerPage><StoreBuilder /></SellerPage>} />
          <Route path="/card-generator"   element={<SellerPage><CardGenerator /></SellerPage>} />
          <Route path="/analytics"        element={<SellerPage><Analytics /></SellerPage>} />
          <Route path="/seller/settings"  element={<SellerPage><SellerSettings /></SellerPage>} />

          {/* ── Orders (accessible to both sellers and buyers, inside DashboardLayout for sellers) ── */}
          <Route path="/orders/tracking" element={
            <ProtectedRoute>
              <DashboardLayout><OrderTracking /></DashboardLayout>
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