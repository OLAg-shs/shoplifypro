import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
      
      <div className="auth-box animate-up">
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={32} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Check your email</h2>
            <p style={{ color: 'var(--auth-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
              If an account exists for <span style={{ color: 'white', fontWeight: 600 }}>{email}</span>, you will receive a password reset link shortly.
            </p>
            <Link to="/login/buyer" className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '14px' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
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
                border: '1px solid rgba(37, 99, 235, 0.2)'
              }}>
                <Mail size={32} />
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Forgot <span style={{ color: 'var(--primary)' }}>Password?</span>
              </h2>
              <p style={{ color: 'var(--auth-muted)', fontWeight: 500 }}>No worries, we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                  <CheckCircle size={18} style={{ color: '#ef4444' }} /> {error}
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 2 }} />
                  <input 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: '48px' }} 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '56px', marginTop: '1.5rem', borderRadius: '14px', fontSize: '1.05rem' }}
                disabled={loading}
              >
                {loading ? <Loader size={20} className="spinner" /> : 'Send Reset Link'}
              </button>
            </form>
            
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link to="/login/buyer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--auth-muted)', textDecoration: 'none', fontSize: '0.9rem', justifyContent: 'center', fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
