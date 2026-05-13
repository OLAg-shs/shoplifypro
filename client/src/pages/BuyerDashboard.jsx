import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Settings, Package, 
  MapPin, CreditCard, Clock, ChevronRight, 
  Search, Star, Bell, ArrowUpRight
} from 'lucide-react';
import { api } from '../utils/api';

const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Welcome Section */}
      <div className="animate-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {user.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track your deliveries and explore new arrivals in the marketplace.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ borderRadius: '12px' }}>
            <Bell size={18} />
          </button>
          <Link to="/" className="btn btn-primary" style={{ borderRadius: '12px' }}>
            <Search size={18} /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="animate-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card hover-lift" style={{ padding: '2rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <ShoppingBag size={24} />
            <ArrowUpRight size={20} opacity={0.7} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{orders.length}</div>
          <div style={{ opacity: 0.8, fontWeight: 500 }}>Active Orders</div>
        </div>

        <div className="card hover-lift" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <Heart size={24} color="#ef4444" />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>+4 NEW</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>12</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Wishlist Items</div>
        </div>

        <div className="card hover-lift" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <CreditCard size={24} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>$0.00</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Store Credit</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
        {/* Recent Orders */}
        <div className="animate-up delay-2">
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Orders</h3>
              <Link to="/orders/tracking" style={{ color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>View All History</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <div key={order.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.5rem 2rem',
                    borderBottom: idx === orders.length - 1 ? 'none' : '1px solid var(--border-medium)',
                    transition: 'background 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ShoppingBag size={24} color="#64748b" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id.substring(0, 8)}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>${parseFloat(order.total_amount).toFixed(2)}</div>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '100px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#16a34a',
                        textTransform: 'uppercase'
                      }}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Account Quick Links */}
        <div className="animate-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Account Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/profile" className="nav-item-link">
                <Settings size={18} /> Account Settings <ChevronRight size={16} />
              </Link>
              <Link to="/addresses" className="nav-item-link">
                <MapPin size={18} /> Shipping Addresses <ChevronRight size={16} />
              </Link>
              <Link to="/payments" className="nav-item-link">
                <CreditCard size={18} /> Payment Methods <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', background: '#f8fafc', border: '1px dashed var(--border-medium)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Support</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Need help with an order or have a question about the platform?
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }}>Contact Help Center</button>
          </div>
        </div>
      </div>
      
      <style>{`
        .nav-item-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: var(--text-main);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: background 0.2s ease;
        }
        .nav-item-link:hover {
          background: #f1f5f9;
        }
        .nav-item-link svg:last-child {
          margin-left: auto;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;
