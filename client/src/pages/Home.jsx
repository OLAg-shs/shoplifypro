import React from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, ShieldCheck, ArrowRight, Search, Globe, Zap, Users } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: '8rem 2rem 6rem 2rem', 
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        borderBottom: '1px solid var(--border-medium)'
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 20px', 
            background: 'white', 
            border: '1px solid var(--border-medium)', 
            borderRadius: '100px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--primary-accent)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <Zap size={14} />
            The Future of Global Commerce
          </div>
          
          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: '800', 
            lineHeight: '1.1',
            letterSpacing: '-0.04em',
            color: 'var(--primary)',
            margin: 0
          }}>
            Build your empire. <br/>
            <span style={{ color: 'var(--primary-accent)' }}>Scale with precision.</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.35rem', 
            color: 'var(--text-muted)', 
            maxWidth: '700px', 
            lineHeight: '1.6',
            margin: '0 auto'
          }}>
            Eagle Choice is the enterprise-grade multi-vendor platform designed for high-growth businesses. 
            From AI storefronts to visual order tracking, we provide the tools you need to win.
          </p>
          
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }}>
              Create Your Business Account <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </Link>
            <Link to="/login/seller" className="btn btn-secondary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }}>
              Seller Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Trust Bar */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border-medium)' }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-accent)', marginBottom: '0.5rem' }}>$1.2B+</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Annual Transactions</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-accent)', marginBottom: '0.5rem' }}>150k+</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Active Sellers</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-accent)', marginBottom: '0.5rem' }}>200+</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Global Regions</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-accent)', marginBottom: '0.5rem' }}>99.9%</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Platform Uptime</p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>One platform. Every tool you need.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            We've built the most comprehensive e-commerce infrastructure so you can focus on your customers.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2.5rem'
        }}>
          <div className="card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: '#2563eb' }}>
              <Globe size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Global Infrastructure</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Deploy your store to our global edge network instantly. Deliver high-speed shopping experiences to customers on every continent.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: '#16a34a' }}>
              <TrendingUp size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Smart Analytics</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Understand your business like never before with real-time sales tracking, customer behavior analysis, and automated reports.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: '#ea580c' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Multi-Vendor Control</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Manage thousands of individual sellers seamlessly. Our platform handles the complexity of vendor payouts, permissions, and security.
            </p>
          </div>
        </div>
      </section>
      
      {/* Visual Order Tracking CTA Section */}
      <section style={{ 
        padding: '10rem 2rem', 
        textAlign: 'center', 
        background: '#0f172a',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Search size={64} style={{ color: 'var(--primary-accent)', marginBottom: '2rem', margin: '0 auto' }} />
          <h2 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1.5rem' }}>Excellence in Order Fulfillment.</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', fontSize: '1.25rem', lineHeight: '1.6' }}>
            Provide your buyers with a world-class tracking experience. Transparency builds trust, and trust builds your business.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login/buyer" className="btn btn-primary" style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }}>
              Track My Orders
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ backgroundColor: 'transparent', color: 'white', padding: '1.1rem 3rem', fontSize: '1.1rem' }}>
              Join the Network
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;