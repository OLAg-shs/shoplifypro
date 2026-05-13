import React from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, ShieldCheck, ArrowRight, Search, Globe, Zap, Users, Sparkles, Layout, BarChart3 } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        textAlign: 'center', 
        padding: '10rem 2rem 8rem 2rem', 
        background: 'radial-gradient(circle at top right, #f0f7ff 0%, #ffffff 50%)',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(37, 99, 235, 0.03)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }}></div>

        <div className="animate-up" style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 24px', 
            background: 'white', 
            border: '1px solid var(--border-medium)', 
            borderRadius: '100px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--primary-accent)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '2.5rem'
          }}>
            <Sparkles size={14} />
            Revolutionizing Multi-Vendor Commerce
          </div>
          
          <h1 style={{ 
            fontSize: '5rem', 
            fontWeight: '800', 
            lineHeight: '1',
            letterSpacing: '-0.05em',
            color: 'var(--primary)',
            marginBottom: '2rem'
          }}>
            Your vision. <br/>
            <span style={{ 
              background: 'linear-gradient(90deg, var(--primary-accent) 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Perfectly executed.</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'var(--text-muted)', 
            maxWidth: '750px', 
            lineHeight: '1.6',
            margin: '0 auto 3.5rem auto',
            fontWeight: '400'
          }}>
            The definitive platform for high-performance e-commerce. Build customized storefronts, manage complex inventories, and scale globally with AI-driven precision.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.2)' }}>
              Get Started for Free <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </Link>
            <Link to="/login/seller" className="btn btn-secondary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '12px' }}>
              Seller Login
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border-medium)', background: 'white' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          opacity: 0.6
        }}>
          <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#64748b' }}>FORBES</div>
          <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#64748b' }}>TECHCRUNCH</div>
          <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#64748b' }}>WIRED</div>
          <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#64748b' }}>FAST COMPANY</div>
          <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#64748b' }}>THE VERGE</div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section style={{ padding: '10rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'left', marginBottom: '6rem', maxWidth: '800px' }}>
          <div style={{ color: 'var(--primary-accent)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Enterprise Features</div>
          <h2 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '2rem' }}>Engineered for the next generation of commerce.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: '1.6' }}>
            We provide the infrastructure. You provide the vision. Together, we build something extraordinary.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '3rem'
        }}>
          <div className="card" style={{ padding: '3.5rem', borderRadius: '24px', border: 'none', background: '#f8fafc' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', color: 'var(--primary-accent)', boxShadow: 'var(--shadow-subtle)' }}>
              <Layout size={32} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>AI Store Builder</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Generate stunning, branded storefronts in seconds. Our AI analyzes your brand identity to create a unique shopping experience that converts.
            </p>
          </div>

          <div className="card" style={{ padding: '3.5rem', borderRadius: '24px', border: 'none', background: '#f8fafc' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', color: '#10b981', boxShadow: 'var(--shadow-subtle)' }}>
              <Wand2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Visual Intelligence</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Automatic background removal and image enhancement for every product. Professional studio quality, no designer required.
            </p>
          </div>

          <div className="card" style={{ padding: '3.5rem', borderRadius: '24px', border: 'none', background: '#f8fafc' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', color: '#f59e0b', boxShadow: 'var(--shadow-subtle)' }}>
              <BarChart3 size={32} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Unified Operations</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Manage multiple stores, vendors, and agents from a single, intuitive interface. Real-time analytics at your fingertips.
            </p>
          </div>

          <div className="card" style={{ padding: '3.5rem', borderRadius: '24px', border: 'none', background: '#f8fafc' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', color: '#ef4444', boxShadow: 'var(--shadow-subtle)' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Bank-Grade Security</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Your data is protected by the highest standards of encryption. Secure payouts, fraud detection, and multi-factor authentication.
            </p>
          </div>
        </div>
      </section>
      
      {/* Dark CTA Section */}
      <section style={{ 
        padding: '12rem 2rem', 
        textAlign: 'center', 
        background: '#020617',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Gradient Glow */}
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0
        }}></div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '4.5rem', color: 'white', marginBottom: '2rem', letterSpacing: '-0.04em' }}>Ready to build your empire?</h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto 4rem auto', fontSize: '1.35rem', lineHeight: '1.6' }}>
            Join over 150,000 sellers who are scaling their businesses with Eagle Choice.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '12px' }}>
              Launch Your Store
            </Link>
            <Link to="/login/buyer" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '12px' }}>
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;