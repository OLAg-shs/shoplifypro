import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Sparkles, PackageSearch, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: '6rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '2rem',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 16px', 
          background: 'rgba(99, 102, 241, 0.1)', 
          border: '1px solid rgba(99, 102, 241, 0.3)', 
          borderRadius: '2rem',
          color: '#a5b4fc',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          <Sparkles size={16} />
          <span>The Next Generation of E-Commerce</span>
        </div>
        
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: '800', 
          lineHeight: '1.1',
          margin: 0,
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          maxWidth: '800px'
        }}>
          Build your empire with <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Eagle Choice</span>
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-muted)', 
          maxWidth: '600px', 
          lineHeight: '1.6',
          margin: 0
        }}>
          The AI-powered multi-seller platform. Launch your uniquely branded store, generate viral ad cards, and manage products automatically.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
            Start Selling Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </Link>
          <Link to="/login/seller" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
            Seller Login
          </Link>
          <Link to="/login/buyer" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
            Buyer Login
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        marginTop: '4rem' 
      }}>
        {/* Feature 1 */}
        <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#818cf8' }}>
            <Store size={26} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Store Builder</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Just describe your dream store in plain English. Our AI instantly generates a customized layout, theme, and color palette.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#34d399' }}>
            <Zap size={26} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Magic Background Removal</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Upload raw product photos and our built-in AI will strip the background instantly, giving you studio-quality images for free.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#fbbf24' }}>
            <PackageSearch size={26} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Visual Order Tracking</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Give your buyers peace of mind with a beautiful, real-time visual progress tracker from purchase to delivery.
          </p>
        </div>
      </section>
      
      {/* Trust Section */}
      <section style={{ marginTop: '6rem', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
        <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built for scale. Designed for speed.</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.1rem' }}>
          Join the next generation of online sellers building their empires on a platform that puts design and AI first.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
          Create Your Store
        </Link>
      </section>
    </div>
  );
};

export default Home;