import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Store, ShoppingBag, DollarSign,
  Sparkles, CreditCard, Settings, Users,
  TrendingUp, ArrowRight, Zap, ArrowUpRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="card animate-up" style={{ padding: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e2e8f0',
        color: 'var(--primary-accent)'
      }}>
        <Icon size={24} />
      </div>
      {trend && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          fontSize: '0.875rem', 
          color: trendUp ? '#10b981' : '#ef4444',
          fontWeight: '600',
          padding: '4px 8px',
          background: trendUp ? '#f0fdf4' : '#fef2f2',
          borderRadius: '100px'
        }}>
          {trend} {trendUp ? <ArrowUpRight size={14} /> : null}
        </div>
      )}
    </div>
    <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>{label}</div>
  </div>
);

const ActionCard = ({ icon: Icon, title, description, link, color }) => (
  <Link to={link} className="card animate-up" style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${color}10`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: color
    }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color, fontWeight: '600', fontSize: '0.9rem', marginTop: 'auto' }}>
      Launch Tool <ArrowRight size={16} />
    </div>
  </Link>
);

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalStores: 1,
    totalProducts: 5,
    totalOrders: 12,
    totalRevenue: 2450.00,
  });
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Welcome Header */}
      <div className="animate-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your business operations and AI tools.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">Download Report</button>
          <Link to="/products/manage" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <StatCard icon={DollarSign} label="Net Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend="+12.5%" trendUp={true} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} trend="+4" trendUp={true} />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} trend="Stable" trendUp={true} />
        <StatCard icon={Store} label="Active Stores" value={stats.totalStores} />
      </div>

      {/* AI Tools Section */}
      <div className="animate-up" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-accent)', boxShadow: '0 0 12px var(--primary-accent)' }}></div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Business Optimization Tools</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          <ActionCard 
            icon={Sparkles} 
            title="AI Store Builder" 
            description="Our neural engine generates high-converting storefronts based on your brand description." 
            link="/store-builder" 
            color="#6366f1"
          />
          <ActionCard 
            icon={CreditCard} 
            title="Ad Card Engine" 
            description="Design professional, viral-ready advertising cards for your products in a single click." 
            link="/card-generator" 
            color="#ec4899"
          />
          <ActionCard 
            icon={Settings} 
            title="Operations Manager" 
            description="Control inventory, manage orders, and optimize your multi-vendor supply chain." 
            link="/products/manage" 
            color="#2563eb"
          />
        </div>
      </div>

      {/* Quick Actions / Integration Status */}
      <div className="card animate-up" style={{ padding: '3rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>Ready to expand?</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '500px' }}>
              Connect your existing Shopify or WooCommerce stores to Eagle Choice and manage everything from a single unified dashboard.
            </p>
          </div>
          <button className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)', padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
            Connect Integration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;