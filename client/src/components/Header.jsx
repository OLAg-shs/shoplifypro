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
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    transition: 'color 0.2s ease',
    fontSize: '0.95rem',
  });

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      {/* Logo */}
      <Link to="/" className="logo" style={{ color: 'var(--text-main)' }}>
        <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
        Eagle Choice
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