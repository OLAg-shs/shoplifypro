import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginBuyer from './pages/LoginBuyer';
import LoginSeller from './pages/LoginSeller';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderTracking from './pages/OrderTracking';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import StoreBuilder from './pages/StoreBuilder';
import CardGenerator from './pages/CardGenerator';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginBuyer />} />
            <Route path="/login/buyer" element={<LoginBuyer />} />
            <Route path="/login/seller" element={<LoginSeller />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/products/manage" element={<ProtectedRoute allowedRoles={['seller']}><ProductManagement /></ProtectedRoute>} />
            <Route path="/orders/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/store-builder" element={<ProtectedRoute allowedRoles={['seller']}><StoreBuilder /></ProtectedRoute>} />
            <Route path="/card-generator" element={<ProtectedRoute allowedRoles={['seller']}><CardGenerator /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;