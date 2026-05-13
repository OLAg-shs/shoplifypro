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
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/products/manage" element={<ProductManagement />} />
            <Route path="/orders/tracking" element={<OrderTracking />} />
            <Route path="/store-builder" element={<StoreBuilder />} />
            <Route path="/card-generator" element={<CardGenerator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;