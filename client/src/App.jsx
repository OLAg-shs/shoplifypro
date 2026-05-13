import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginBuyer from './pages/LoginBuyer';
import LoginSeller from './pages/LoginSeller';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderTracking from './pages/OrderTracking';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import StoreBuilder from './pages/StoreBuilder';
import CardGenerator from './pages/CardGenerator';

const DashboardSelector = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role) {
    case 'seller':
      return <SellerDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'buyer':
    default:
      return <BuyerDashboard />;
  }
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes (with Header/Footer) */}
          <Route path="/" element={<><Header /><Home /><Footer /></>} />
          <Route path="/login/buyer" element={<><Header /><LoginBuyer /><Footer /></>} />
          <Route path="/login/seller" element={<><Header /><LoginSeller /><Footer /></>} />
          <Route path="/register" element={<><Header /><Register /><Footer /></>} />
          
          {/* Dashboard Routing based on role */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardSelector />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Legacy path support */}
          <Route path="/seller/dashboard" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout><SellerDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/products/manage" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout><ProductManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/store-builder" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout><StoreBuilder /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/card-generator" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout><CardGenerator /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Buyer/Shared Protected Routes */}
          <Route path="/orders/tracking" element={
            <ProtectedRoute>
              <><Header /><OrderTracking /><Footer /></>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;