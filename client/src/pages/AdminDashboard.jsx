import React, { useState, useEffect } from 'react';
import { 
  Users, Store, DollarSign, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, Activity, Package
} from 'lucide-react';
import { api } from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, sellersData, activityData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/auth/admin/pending-sellers'),
        api.get('/admin/activity')
      ]);
      setStats(statsData);
      setPendingSellers(sellersData);
      setActivity(activityData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSellerAction = async (sellerId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this seller?`)) return;
    
    setActionLoading(sellerId);
    try {
      await api.put(`/auth/admin/seller/${sellerId}`, { action });
      // Remove from list locally to save an API call
      setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
      alert(`Seller successfully ${action}d!`);
    } catch (err) {
      console.error(`Failed to ${action} seller`, err);
      alert(`Error trying to ${action} seller.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="spinner" size={32} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Platform Control Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Master Admin {user.name?.split(' ')[0]}</p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card animate-up" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#6366f1' }}><DollarSign size={24} /> <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Total Revenue</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card animate-up delay-1" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#10b981' }}><Store size={24} /> <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Active Stores</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalStores || 0}</div>
        </div>
        <div className="card animate-up delay-2" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#3b82f6' }}><Users size={24} /> <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Total Users</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="card animate-up delay-3" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#f59e0b' }}><Package size={24} /> <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Total Orders</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalOrders || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Pending Sellers */}
        <div className="card animate-up delay-4" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} color="#f59e0b" /> Pending Approvals
            </h2>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
              {pendingSellers.length} New
            </span>
          </div>

          {pendingSellers.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={40} style={{ color: '#10b981', margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              All caught up! No pending sellers.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingSellers.map(seller => (
                <div key={seller.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{seller.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{seller.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleSellerAction(seller.id, 'approve')}
                      disabled={actionLoading === seller.id}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {actionLoading === seller.id ? <RefreshCw size={14} className="spinner" /> : <CheckCircle size={14} />} Approve
                    </button>
                    <button 
                      onClick={() => handleSellerAction(seller.id, 'reject')}
                      disabled={actionLoading === seller.id}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card animate-up delay-5" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Activity size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Signups</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activity?.recentUsers?.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {u.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.role.toUpperCase()} • Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
