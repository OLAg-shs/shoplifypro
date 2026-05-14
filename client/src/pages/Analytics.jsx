import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Package, BarChart2, AlertCircle, Loader, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../utils/api';

// ── Simple Bar Chart ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color = '#2563eb' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.revenue), 1);
  const recent = data.slice(-14); // last 14 days

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {recent.map((d, i) => (
        <div key={i} title={`${d.date}: $${d.revenue}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{
            height: `${Math.max((d.revenue / max) * 80, 2)}px`,
            background: i === recent.length - 1 ? color : `${color}50`,
            borderRadius: '3px 3px 0 0',
            transition: 'height 0.3s ease',
            minHeight: '2px'
          }} />
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const AnalyticCard = ({ icon: Icon, label, value, sub, color = '#2563eb', chart, loading }) => (
  <div className="card" style={{ padding: '1.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        <Icon size={20} />
      </div>
      {sub && (
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: sub > 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
          {sub > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(sub)}%
        </span>
      )}
    </div>
    <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
      {loading ? <Loader size={18} className="spinner" style={{ color: '#94a3b8' }} /> : value}
    </div>
    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: chart ? '1.25rem' : 0 }}>{label}</div>
    {chart && !loading && <MiniBarChart data={chart} color={color} />}
  </div>
);

// ── Status Donut-style row ────────────────────────────────────────────────────
const statusConfig = {
  pending:    { color: '#f59e0b', label: 'Pending' },
  processing: { color: '#3b82f6', label: 'Processing' },
  shipped:    { color: '#6366f1', label: 'Shipped' },
  delivered:  { color: '#10b981', label: 'Delivered' },
  cancelled:  { color: '#ef4444', label: 'Cancelled' },
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await api.get('/analytics/seller');
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalOrdersForStatus = data
    ? Object.values(data.ordersByStatus || {}).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Analytics</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Real-time overview of your store performance.</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <AnalyticCard
          icon={DollarSign} label="Total Revenue" color="#10b981" loading={loading}
          value={`$${(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          chart={data?.revenueByDay}
        />
        <AnalyticCard icon={ShoppingBag} label="Total Orders" color="#2563eb" loading={loading} value={data?.totalOrders ?? 0} />
        <AnalyticCard icon={Package} label="Products Listed" color="#7c3aed" loading={loading} value={data?.totalProducts ?? 0} />
        <AnalyticCard icon={TrendingUp} label="Active Products" color="#f59e0b" loading={loading} value={data?.activeProducts ?? 0} />
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Revenue Chart Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Revenue (30 Days)</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>Daily breakdown</p>
            </div>
            <BarChart2 size={20} style={{ color: '#94a3b8' }} />
          </div>
          {loading ? (
            <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size={24} className="spinner" style={{ color: '#94a3b8' }} />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px' }}>
                {(data?.revenueByDay || []).map((d, i) => {
                  const max = Math.max(...(data?.revenueByDay || []).map(x => x.revenue), 1);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                      title={`${d.date}: $${d.revenue.toFixed(2)}`}>
                      <div style={{
                        height: `${Math.max((d.revenue / max) * 160, 2)}px`,
                        background: i >= 28 ? '#2563eb' : '#dbeafe',
                        borderRadius: '3px 3px 0 0', minHeight: '2px',
                        transition: 'height 0.4s ease'
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>30 days ago</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Today</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Order Status</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>Breakdown by fulfillment stage</p>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
              <Loader size={24} className="spinner" style={{ color: '#94a3b8' }} />
            </div>
          ) : totalOrdersForStatus === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#94a3b8' }}>
              <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No orders yet</p>
            </div>
          ) : (
            <div>
              {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => {
                const cfg = statusConfig[status] || { color: '#94a3b8', label: status };
                const pct = Math.round((count / totalOrdersForStatus) * 100);
                return (
                  <div key={status} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{cfg.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>{count} <span style={{ color: '#94a3b8', fontWeight: '400' }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '100px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Top Products</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>Best performing by order volume</p>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
              <Loader size={20} className="spinner" style={{ color: '#94a3b8' }} />
            </div>
          ) : !data?.topProducts?.length ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Package size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No product sales data yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {data.topProducts.map((p, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', color: '#4f46e5' }}>#{i + 1}</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.quantity} sold · ${p.revenue.toFixed(2)} revenue</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
