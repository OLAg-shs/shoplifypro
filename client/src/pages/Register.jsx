import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)' }}>
      <div className="auth-box animate-up" style={{ maxWidth: '550px', padding: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '18px', background: '#eff6ff', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)', marginBottom: '1.5rem' }}>
            <UserPlus size={32} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Join the Network</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.5rem' }}>Start your journey with Eagle Choice today.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Secure Password</label>
              <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required minLength="6" placeholder="Min. 6 characters" />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <label className={`radio-option ${formData.role === 'buyer' ? 'active' : ''}`} style={{ 
                  borderColor: formData.role === 'buyer' ? 'var(--primary-accent)' : 'var(--border-medium)',
                  background: formData.role === 'buyer' ? '#eff6ff' : 'white',
                  color: formData.role === 'buyer' ? 'var(--primary-accent)' : 'inherit'
                }}>
                  <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={handleChange} style={{ display: 'none' }} />
                  <CheckCircle2 size={18} style={{ opacity: formData.role === 'buyer' ? 1 : 0.2 }} />
                  Buyer Account
                </label>
                <label className={`radio-option ${formData.role === 'seller' ? 'active' : ''}`} style={{ 
                  borderColor: formData.role === 'seller' ? 'var(--primary-accent)' : 'var(--border-medium)',
                  background: formData.role === 'seller' ? '#eff6ff' : 'white',
                  color: formData.role === 'seller' ? 'var(--primary-accent)' : 'inherit'
                }}>
                  <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} style={{ display: 'none' }} />
                  <CheckCircle2 size={18} style={{ opacity: formData.role === 'seller' ? 1 : 0.2 }} />
                  Seller Business
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', marginTop: '2.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>Complete Registration <ArrowRight size={20} /></span>}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.875rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ShieldCheck size={16} />
            Data protected with 256-bit encryption
          </div>
          <p className="auth-footer">
            Already have an account? <Link to="/login/buyer">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;