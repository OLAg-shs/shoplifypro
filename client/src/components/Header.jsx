import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check auth state on every route change
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  const navStyle = ({ isActive }) => ({
    color: isActive ? '#38bdf8' : '#94a3b8',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    letterSpacing: '0.01em'
  });

  return (
    <nav className={scrolled ? 'scrolled' : ''} style={{
      background: scrolled ? 'rgba(2, 6, 23, 0.95)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
      padding: '0 4rem',
      height: scrolled ? '70px' : '90px',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
    }}>
      {/* Logo */}
      <Link to="/" className="logo" style={{ color: 'white', fontSize: '1.4rem', textShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
          <ShoppingBag size={20} />
        </div>
        <span style={{ 
          background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>Eagle Choice</span>
      </Link>

      {/* Nav Links */}
      <div className="nav-links">
        <NavLink to="/" end style={navStyle}>Home</NavLink>
        
        {isAuthenticated && (
          <NavLink to="/dashboard" style={navStyle}>Dashboard</NavLink>
        )}

        {isAuthenticated && userRole === 'seller' && (
          <>
            <NavLink to="/store-builder" style={navStyle}>Store Builder</NavLink>
            <NavLink to="/card-generator" style={navStyle}>Ad Cards</NavLink>
            <NavLink to="/products/manage" style={navStyle}>Products</NavLink>
          </>
        )}
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!isAuthenticated ? (
          <>
            <NavLink to="/login/buyer" style={navStyle}>Buyer Login</NavLink>
            <NavLink to="/login/seller" style={navStyle}>Seller Login</NavLink>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;