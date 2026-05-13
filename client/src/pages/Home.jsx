import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Eagle Choice</h1>
          <p>Discover unique stores and products from sellers around the world</p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Register as Seller</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Multiple Sellers</h3>
          <p>Each seller can create their own branded store</p>
        </div>
        <div className="feature-card">
          <h3>AI Assistance</h3>
          <p>Get help finding exactly what you're looking for</p>
        </div>
        <div className="feature-card">
          <h3>Real-time Tracking</h3>
          <p>Track your orders from purchase to delivery</p>
        </div>
      </section>
    </div>
  );
};

export default Home;