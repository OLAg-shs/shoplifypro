import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Lock } from 'lucide-react';

const LoginBuyer = () => {
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
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error(`Server Error: ${text.substring(0, 50)}...`);
      }
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
      
      <div className="auth-box animate-up">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.05))', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--primary)', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}>
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Welcome <span style={{ color: 'var(--primary)' }}>Back</span>
          </h2>
          <p style={{ color: 'var(--auth-muted)', fontWeight: 500, fontSize: '1rem' }}>
            The world's marketplace is waiting for you.
          </p>
        </div>
        
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <Lock size={18} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="input-field" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="name@company.com" 
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                Forgot password?
              </Link>
            </div>
            <input 
              type="password" 
              name="password" 
              className="input-field" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '56px', marginTop: '1rem', borderRadius: '14px', fontSize: '1.05rem' }} 
            disabled={loading}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                Sign In to Account <ArrowRight size={20} />
              </span>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            color: 'var(--auth-muted)', 
            fontSize: '0.875rem', 
            justifyContent: 'center', 
            marginBottom: '1.5rem',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '100px',
            width: 'fit-content',
            margin: '0 auto 1.5rem auto'
          }}>
            <Lock size={14} style={{ color: '#38bdf8' }} />
            Secure, encrypted authentication
          </div>
          <p style={{ color: 'var(--auth-muted)', fontSize: '0.95rem' }}>
            New to Eagle Choice? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1.5rem 0' }}></div>
          <p style={{ fontSize: '0.9rem' }}>
            <Link to="/login/seller" style={{ color: 'var(--auth-muted)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Login as a verified seller <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginBuyer;
