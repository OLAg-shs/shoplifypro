import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, ArrowRight, ShieldCheck, CheckCircle2, 
  ShoppingBag, Briefcase, Sparkles, Mail, Lock, User
} from 'lucide-react';

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
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      } else {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error(`Server Error: ${text.substring(0, 50)}...`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      position: 'relative',
      overflow: 'hidden',
      color: '#f8fafc'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>

      <div className="animate-up" style={{ 
        width: '100%',
        maxWidth: '1100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Side: Info */}
        <div style={{ 
          padding: '4rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, transparent 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '8px 16px', 
            background: 'rgba(37, 99, 235, 0.1)', 
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#60a5fa',
            width: 'fit-content',
            marginBottom: '2rem'
          }}>
            <Sparkles size={14} /> Eagle Choice Infrastructure
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            Join the <br/>
            <span style={{ background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Network.</span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
            Experience the future of multi-vendor commerce. Whether you're a buyer or a visionary seller, Eagle Choice provides the elite tools you need to succeed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { icon: CheckCircle2, text: 'AI-Powered Personalization' },
              { icon: CheckCircle2, text: 'Global Marketplace Access' },
              { icon: CheckCircle2, text: 'Enterprise-Grade Security' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#38bdf8' }}><item.icon size={20} /></div>
                <span style={{ fontWeight: 500, color: '#cbd5e1' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '4rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: '#64748b', fontWeight: 500 }}>Enter your details below to get started.</p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#f87171', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              
              {/* Role Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div 
                  onClick={() => setFormData(prev => ({...prev, role: 'buyer'}))}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: formData.role === 'buyer' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                    background: formData.role === 'buyer' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <ShoppingBag size={24} color={formData.role === 'buyer' ? '#3b82f6' : '#64748b'} style={{ marginBottom: '10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.role === 'buyer' ? 'white' : '#94a3b8' }}>Buyer</div>
                </div>
                <div 
                  onClick={() => setFormData(prev => ({...prev, role: 'seller'}))}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: formData.role === 'seller' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                    background: formData.role === 'seller' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <Briefcase size={24} color={formData.role === 'seller' ? '#3b82f6' : '#64748b'} style={{ marginBottom: '10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.role === 'seller' ? 'white' : '#94a3b8' }}>Seller</div>
                </div>
              </div>

              {/* Name */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} required 
                    placeholder="John Doe"
                    style={{ 
                      width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem'
                    }} 
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required 
                    placeholder="john@example.com"
                    style={{ 
                      width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem'
                    }} 
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                    placeholder="••••••••"
                    style={{ 
                      width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem'
                    }} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '1.1rem', marginTop: '2.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
              }}
            >
              {loading ? 'Processing...' : <>Create Empire <ArrowRight size={20} /></>}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Already a member? <Link to="/login/buyer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;