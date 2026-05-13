import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Store, ShoppingBag, DollarSign,
  TrendingUp, ArrowRight, ArrowUpRight, Clock, User
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="card" style={{ padding: '2rem' }}>
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

const SellerDashboard = () => {
  const [stats] = useState({
    totalStores: 1,
    totalProducts: 5,
    totalOrders: 12,
    totalRevenue: 2450.00,
  });

  const recentOrders = [
    { id: '#ORD-9921', customer: 'Sarah Jenkins', date: '2 mins ago', amount: '$129.00', status: 'Processing' },
    { id: '#ORD-9920', customer: 'Michael Chen', date: '45 mins ago', amount: '$45.50', status: 'Shipped' },
    { id: '#ORD-9919', customer: 'Emma Wilson', date: '3 hours ago', amount: '$210.00', status: 'Processing' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Business Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your multi-vendor operations are performing optimally.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">Export Data</button>
          <Link to="/products/manage" className="btn btn-primary">+ New Product</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <StatCard icon={DollarSign} label="Net Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend="+12.5%" trendUp={true} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} trend="+4" trendUp={true} />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} trend="Stable" trendUp={true} />
        <StatCard icon={Store} label="Active Stores" value={stats.totalStores} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
        {/* Recent Orders List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Orders</h3>
            <Link to="/orders/tracking" style={{ color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentOrders.map((order, idx) => (
              <div key={order.id} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr auto',
                alignItems: 'center',
                padding: '1.25rem 2rem',
                borderBottom: idx === recentOrders.length - 1 ? 'none' : '1px solid var(--border-medium)',
                gap: '1rem'
              }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{order.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="var(--text-muted)" />
                  </div>
                  <span style={{ fontWeight: '500' }}>{order.customer}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {order.date}
                </div>
                <div style={{ fontWeight: '700' }}>{order.amount}</div>
                <div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: order.status === 'Shipped' ? '#ecfdf5' : '#eff6ff',
                    color: order.status === 'Shipped' ? '#059669' : '#2563eb'
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem' }}>Pro Plan Feature</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Unlock advanced AI analytics and multi-region shipping controls by upgrading to the Eagle Pro plan today.
            </p>
            <button className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)', width: '100%' }}>
              Upgrade Now
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Platform Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>API Connectivity</span>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>OPERATIONAL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Store Builder Engine</span>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;