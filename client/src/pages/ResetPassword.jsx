import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token: pathToken } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Extract token from URL hash (Supabase format) or path params
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace('#', '?'));
    const token = hashParams.get('access_token') || pathToken;

    if (!token) {
      return setError('Invalid or expired reset link. Please request a new one from the Forgot Password page.');
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', 
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/login/buyer'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box animate-up" style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Success!</h2>
          <p style={{ color: 'var(--auth-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Your password has been successfully reset. You will be redirected to login shortly...
          </p>
          <Link to="/login/buyer" className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '14px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>
      
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
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Set New <span style={{ color: 'var(--primary)' }}>Password</span>
          </h2>
          <p style={{ color: 'var(--auth-muted)', fontWeight: 500 }}>Choose a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 2 }} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                style={{ paddingLeft: '48px', paddingRight: '48px' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 2 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 2 }} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                style={{ paddingLeft: '48px' }} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <Loader size={20} className="spinner" /> : 'Update Password'}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link to="/login/buyer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--auth-muted)', textDecoration: 'none', fontSize: '0.9rem', justifyContent: 'center', fontWeight: 600 }}>
             Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
