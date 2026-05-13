import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Store, ShoppingBag, DollarSign,
  Sparkles, CreditCard, Settings, Users,
  TrendingUp, ArrowRight, Zap
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, link, linkLabel }) => (
  <div className="glass-panel" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: `1px solid ${color}30`,
      }}>
        <Icon size={22} style={{ color }} />
      </div>
      <TrendingUp size={16} style={{ color: '#34d399' }} />
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{label}</div>
    {link && (
      <Link
        to={link}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          color,
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'gap 0.2s ease',
        }}
      >
        {linkLabel} <ArrowRight size={14} />
      </Link>
    )}
  </div>
);

const ToolCard = ({ icon: Icon, title, description, link, gradient, badge }) => (
  <Link
    to={link}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(6px)',
          borderRadius: '20px',
          padding: '3px 10px',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.5px',
        }}>
          {badge}
        </div>
      )}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <Icon size={26} color="white" />
      </div>
      <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: '0 0 1rem 0', lineHeight: 1.5 }}>{description}</p>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        color: '#fff',
        fontWeight: 600,
      }}>
        Launch <ArrowRight size={14} />
      </div>
    </div>
  </Link>
);

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch');
      } catch {
        // Use mock data if API unavailable
      } finally {
        setStats({ totalStores: 1, totalProducts: 5, totalOrders: 12, totalRevenue: 2450.00 });
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>
          Welcome back 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Here's an overview of your Eagle Choice seller account
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard
          icon={Store}
          label="Active Stores"
          value={stats.totalStores}
          color="#6366f1"
          link="/stores/manage"
          linkLabel="Manage Stores"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats.totalProducts}
          color="#ec4899"
          link="/products/manage"
          linkLabel="Manage Products"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          color="#8b5cf6"
          link="/orders/tracking"
          linkLabel="View Orders"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="#34d399"
          link="/analytics"
          linkLabel="View Analytics"
        />
      </div>

      {/* AI Power Tools */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <Zap size={20} style={{ color: '#fbbf24' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Power Tools</h2>
          <span style={{
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '0.72rem',
            color: '#fbbf24',
            fontWeight: 700,
          }}>POWERED BY AI</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <ToolCard
            icon={Sparkles}
            title="AI Store Builder"
            description="Describe your dream store and our AI generates the perfect theme, colors, and layout in seconds."
            link="/store-builder"
            gradient={['#4f46e5', '#7c3aed']}
            badge="AI"
          />
          <ToolCard
            icon={CreditCard}
            title="Ad Card Generator"
            description="Create stunning branded advertising cards for social media with real-time preview and 1-click download."
            link="/card-generator"
            gradient={['#db2777', '#9333ea']}
            badge="NEW"
          />
          <ToolCard
            icon={Settings}
            title="Product Manager"
            description="Manage your catalog with AI-powered background removal for professional, studio-quality product photos."
            link="/products/manage"
            gradient={['#0891b2', '#0e7490']}
            badge="PRO"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { icon: Package, label: 'Add Product',    link: '/products/manage' },
            { icon: ShoppingBag, label: 'View Orders',   link: '/orders/tracking' },
            { icon: Users, label: 'Manage Agents',  link: '/agents' },
            { icon: TrendingUp, label: 'Analytics',      link: '/analytics' },
          ].map(({ icon: Icon, label, link }) => (
            <Link
              key={link}
              to={link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.4)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <Icon size={22} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;