import React from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, ShieldCheck, ArrowRight, PackageSearch } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: '6rem 1rem 4rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          lineHeight: '1.2',
          margin: 0,
          color: 'var(--text-main)',
          maxWidth: '800px'
        }}>
          The ultimate platform to <span style={{ color: 'var(--primary)' }}>launch your online business.</span>
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-muted)', 
          maxWidth: '650px', 
          lineHeight: '1.6',
          margin: '1rem 0'
        }}>
          Eagle Choice provides sellers with everything needed to build a brand, manage inventory, and securely process orders on a reliable multi-vendor network.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Start Selling Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </Link>
          <Link to="/login/seller" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Seller Login
          </Link>
          <Link to="/login/buyer" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Track My Order
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '2rem', 
        marginTop: '2rem',
        padding: '0 1rem'
      }}>
        {/* Feature 1 */}
        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#2563eb' }}>
            <Store size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Custom Storefronts</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Launch a fully branded, customized storefront. Manage your unique identity without writing a single line of code.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#059669' }}>
            <TrendingUp size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Built-in Marketing</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Generate professional advertising cards and product layouts automatically to drive traffic and increase your conversions.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#dc2626' }}>
            <PackageSearch size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Streamlined Order Management</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Provide your buyers with a reliable order tracking system. Update fulfillment statuses in real-time from your secure dashboard.
          </p>
        </div>
      </section>
      
      {/* Trust Section */}
      <section style={{ 
        marginTop: '6rem', 
        textAlign: 'center', 
        padding: '5rem 2rem', 
        background: '#ffffff', 
        borderRadius: '24px', 
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem', margin: '0 auto' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Secure. Reliable. Scalable.</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem auto', fontSize: '1.1rem' }}>
          Eagle Choice is built on enterprise-grade infrastructure. Your data, products, and customer transactions are fully secured.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.1rem' }}>
          Create Your Store Today
        </Link>
      </section>
    </div>
  );
};

export default Home;