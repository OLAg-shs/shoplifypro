import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Store, ShoppingBag, DollarSign,
  TrendingUp, ArrowUpRight, Clock, User, Loader,
  AlertCircle, RefreshCw, Plus, ChevronRight,
  CheckCircle, Zap, ExternalLink
} from 'lucide-react';
import { api } from '../utils/api';

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, trend, trendUp, loading, color = '#2563eb', delay = 0 }) => (
  <div className="card" style={{ padding: '1.75rem', animationDelay: `${delay}ms` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: `${color}15`, display: 'flex',
        justifyContent: 'center', alignItems: 'center', color
      }}>
        <Icon size={22} />
      </div>
      {trend && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '0.8rem', color: trendUp ? '#10b981' : '#ef4444',
          fontWeight: '700', padding: '3px 8px',
          background: trendUp ? '#f0fdf4' : '#fef2f2', borderRadius: '100px'
        }}>
          <ArrowUpRight size={12} /> {trend}
        </div>
      )}
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.03em', color: '#0f172a' }}>
      {loading ? <Loader size={20} className="spinner" style={{ color: '#94a3b8' }} /> : value}
    </div>
    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{label}</div>
  </div>
);

// ── Order Status Badge ────────────────────────────────────────────────────────
const statusColors = {
  delivered:  { bg: '#ecfdf5', color: '#059669' },
  shipped:    { bg: '#eff6ff', color: '#2563eb' },
  processing: { bg: '#fffbeb', color: '#d97706' },
  pending:    { bg: '#f8fafc', color: '#64748b' },
  cancelled:  { bg: '#fef2f2', color: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const s = statusColors[status] || statusColors.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '0.7rem',
      fontWeight: '700', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>{status}</span>
  );
};

// ── Setup Step Component ──────────────────────────────────────────────────────
const SetupStep = ({ num, title, desc, done, linkTo, linkLabel }) => (
  <div style={{
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
    padding: '1.25rem', borderRadius: '12px',
    background: done ? '#f0fdf4' : '#f8fafc',
    border: `1px solid ${done ? '#bbf7d0' : '#e2e8f0'}`,
    marginBottom: '1rem'
  }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: done ? '#10b981' : '#e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: done ? 'white' : '#94a3b8', fontWeight: '800', fontSize: '0.8rem'
    }}>
      {done ? <CheckCircle size={16} /> : num}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px', color: done ? '#059669' : '#0f172a' }}>{title}</div>
      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{desc}</div>
    </div>
    {!done && linkTo && (
      <Link to={linkTo} style={{
        flexShrink: 0, padding: '6px 14px', borderRadius: '8px',
        background: '#0f172a', color: 'white', textDecoration: 'none',
        fontSize: '0.8rem', fontWeight: '700', whiteSpace: 'nowrap'
      }}>{linkLabel}</Link>
    )}
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [stats, setStats] = useState({ totalStores: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [store, setStore] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch: seller's own products, store, and orders
      const [products, storeData, orders] = await Promise.allSettled([
        api.get('/products/mine'),
        api.get('/stores/mine'),
        api.get('/orders/store'),
      ]);

      // Products
      const productList = products.status === 'fulfilled' ? products.value : [];

      // Store
      const storeInfo = storeData.status === 'fulfilled' ? storeData.value : null;
      setStore(storeInfo);

      // Orders
      const orderList = orders.status === 'fulfilled' ? orders.value : [];
      const revenue = orderList.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

      setStats({
        totalStores: storeInfo ? 1 : 0,
        totalProducts: productList.length,
        totalOrders: orderList.length,
        totalRevenue: revenue,
      });

      setRecentOrders(orderList.slice(0, 5));
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please try refreshing.');
      console.error('[DASHBOARD FETCH ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Setup checklist state
  const hasStore    = !!store;
  const hasProducts = stats.totalProducts > 0;
  const isPublished = store?.is_published;
  const setupComplete = hasStore && hasProducts && isPublished;
  const setupProgress = [hasStore, hasProducts, isPublished].filter(Boolean).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
            Welcome back, {user.name?.split(' ')[0] || 'Seller'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            {setupComplete ? 'Your store is live and running.' : `Complete your store setup — ${setupProgress}/3 steps done.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {lastRefresh && (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}
            style={{ height: '44px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} className={loading ? 'spinner' : ''} /> Refresh
          </button>
          <Link to="/products/manage" className="btn btn-primary" style={{ height: '44px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} /> New Product
          </Link>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#ef4444', marginBottom: '2rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: '500' }}>{error}</span>
          <button onClick={fetchDashboardData} style={{
            background: '#ef4444', color: 'white', border: 'none',
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
          }}>Retry</button>
        </div>
      )}

      {/* ── Setup Onboarding (shown until store is live) ── */}
      {!setupComplete && !loading && (
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: 'none', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Zap size={18} style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Setup</span>
              </div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Get your store live</h2>
              <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Complete these {3} steps to start selling.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>{setupProgress}<span style={{ color: '#94a3b8', fontSize: '1.5rem' }}>/3</span></div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Steps complete</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', marginBottom: '1.5rem' }}>
            <div style={{ height: '100%', borderRadius: '100px', background: '#3b82f6', width: `${(setupProgress / 3) * 100}%`, transition: 'width 0.5s ease' }} />
          </div>
          <SetupStep num={1} title="Store Created" desc="Your store has been set up and is ready to configure." done={hasStore} linkTo="/store-builder" linkLabel="Create Store" />
          <SetupStep num={2} title="Add Products" desc="Add at least one product to your catalog." done={hasProducts} linkTo="/products/manage" linkLabel="Add Products" />
          <SetupStep num={3} title="Publish Store" desc="Make your store visible to customers and go live." done={isPublished} linkTo="/store-builder" linkLabel="Publish Now" />
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={DollarSign} label="Net Revenue" value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} loading={loading} color="#10b981" delay={0} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} loading={loading} color="#2563eb" delay={50} />
        <StatCard icon={Package} label="Products Listed" value={stats.totalProducts} loading={loading} color="#7c3aed" delay={100} />
        <StatCard icon={Store} label="Active Stores" value={stats.totalStores} loading={loading} color="#f59e0b" delay={150} />
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Recent Orders */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Orders</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Last 5 transactions</p>
            </div>
            <Link to="/orders/tracking" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Loader size={24} className="spinner" style={{ margin: '0 auto 12px', display: 'block' }} />
              Loading orders...
            </div>
          )}

          {!loading && recentOrders.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <ShoppingBag size={40} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontWeight: '500', margin: 0 }}>No orders received yet.</p>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '4px 0 0' }}>Orders will appear here once customers start buying.</p>
            </div>
          )}

          {!loading && recentOrders.map((order, idx) => (
            <div key={order.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 110px 90px 90px',
              alignItems: 'center',
              padding: '1.1rem 1.75rem',
              borderBottom: idx === recentOrders.length - 1 ? 'none' : '1px solid #f1f5f9',
              gap: '1rem',
              transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                #{order.id?.substring(0, 8).toUpperCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={14} color="#94a3b8" />
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>{order.users?.name || 'Customer'}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} />
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                ${parseFloat(order.total_amount).toFixed(2)}
              </div>
              <StatusBadge status={order.order_status} />
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Store Status Card */}
          {store ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Your Store</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: store.branding?.primaryColor || '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{store.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/{store.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Status</span>
                <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', background: store.is_published ? '#ecfdf5' : '#fef9c3', color: store.is_published ? '#059669' : '#854d0e' }}>
                  {store.is_published ? '● Live' : '○ Draft'}
                </span>
              </div>
              <Link to="/store-builder" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                color: '#374151', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}>
                <ExternalLink size={14} /> Customize Store
              </Link>
            </div>
          ) : !loading && (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <Store size={32} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontWeight: '700', margin: '0 0 4px' }}>No store yet</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>Your store will appear after admin approval.</p>
            </div>
          )}

          {/* Quick Links */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Quick Actions</h3>
            {[
              { label: 'Add New Product', icon: Package, to: '/products/manage', color: '#2563eb' },
              { label: 'AI Store Builder', icon: TrendingUp, to: '/store-builder', color: '#7c3aed' },
              { label: 'Ad Generator', icon: Zap, to: '/card-generator', color: '#f59e0b' },
              { label: 'Analytics', icon: TrendingUp, to: '/analytics', color: '#10b981' },
            ].map(({ label, icon: Icon, to, color }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0.75rem', borderRadius: '10px', marginBottom: '6px',
                textDecoration: 'none', color: '#374151', fontWeight: '500',
                fontSize: '0.875rem', transition: 'background 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon size={16} />
                </div>
                {label}
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#94a3b8' }} />
              </Link>
            ))}
          </div>

          {/* Platform Status */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Platform Status</h3>
            {[
              { label: 'API Connectivity', ok: true },
              { label: 'Store Builder Engine', ok: true },
              { label: 'AI Services', ok: true },
              { label: 'Payment Gateway', ok: false, note: 'Coming soon' },
            ].map(({ label, ok, note }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
                <span style={{ fontWeight: '700', fontSize: '0.75rem', color: ok ? '#10b981' : '#94a3b8' }}>
                  {note || (ok ? '● OPERATIONAL' : '○ OFFLINE')}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;