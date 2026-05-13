import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginSeller = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/seller/dashboard');
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container" style={{ background: '#0f172a' }}>
      <div className="auth-box animate-up" style={{ padding: '4rem 3.5rem', borderTop: 'none', borderLeft: '4px solid var(--primary-accent)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '18px', background: '#eff6ff', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)', marginBottom: '1.5rem' }}>
            <Store size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Seller Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Access your global business dashboard.</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Email</label>
            <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required placeholder="business@eaglechoice.com" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: '600' }}>Forgot password?</Link>
            </div>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '52px', marginTop: '1rem', background: 'var(--primary)' }} disabled={loading}>
            {loading ? 'Verifying Credentials...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>Access Dashboard <ArrowRight size={20} /></span>}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.875rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ShieldCheck size={14} />
            Enterprise-grade secure connection
          </div>
          <p className="auth-footer">
            Want to start selling? <Link to="/register">Register your business</Link>
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <Link to="/login/buyer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Login as a customer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSeller;
