import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  Sparkles,
  CreditCard,
  LogOut,
  Store,
} from 'lucide-react';
import AIAssistant from './AIAssistant';


const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Store size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0, letterSpacing: '-0.02em' }}>Eagle Choice</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELLER ADMIN</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '1rem' }}>Main Menu</div>
          <NavLink to="/seller/dashboard" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/products/manage" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/orders/tracking" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <ShoppingBag size={20} /> Orders
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <TrendingUp size={20} /> Analytics
          </NavLink>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2rem 0 1rem 0', paddingLeft: '1rem' }}>AI Tools</div>
          <NavLink to="/store-builder" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <Sparkles size={20} /> AI Store Builder <span className="badge badge-ai" style={{ marginLeft: 'auto' }}>AI</span>
          </NavLink>
          <NavLink to="/card-generator" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <CreditCard size={20} /> Ad Generator
          </NavLink>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2rem 0 1rem 0', paddingLeft: '1rem' }}>Account</div>
          <NavLink to="/seller/settings" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-medium)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary)' }}>
              {user.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user.name || 'Seller'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free Plan</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="animate-up">
          {children}
        </div>
      </main>

      {/* ── AI Assistant (persistent floating widget) ── */}
      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;

