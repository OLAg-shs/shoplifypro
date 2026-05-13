import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';

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
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderTop: '4px solid #6366f1' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Store size={32} />
          </div>
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Seller Portal</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your store, products, and AI cards</p>
        
        {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Business Email</label>
            <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', border: 'none' }} disabled={loading}>
            {loading ? 'Authenticating...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Access Dashboard <ArrowRight size={18} style={{ marginLeft: '8px' }} /></span>}
          </button>
        </form>
        
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
          Want to become a seller? <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none' }}>Apply here</Link>
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/login/buyer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>I am a buyer</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginSeller;
