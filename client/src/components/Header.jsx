import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Store, Package, Zap } from 'lucide-react';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (e) {
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> }] : []),
    ...(isAuthenticated && userRole === 'seller' ? [
      { name: 'Builder', path: '/store-builder', icon: <Store size={16} /> },
      { name: 'Ad Cards', path: '/card-generator', icon: <Zap size={16} /> },
      { name: 'Products', path: '/products/manage', icon: <Package size={16} /> },
    ] : []),
  ];

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <Link to="/" className="header-logo">
          <div className="logo-icon-wrapper">
            <ShoppingBag size={22} />
          </div>
          <span className="logo-text">Eagle Choice</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="header-actions">
          {!isAuthenticated ? (
            <>
              <div className="auth-links-desktop">
                <Link to="/login/buyer" className="auth-link">Buyer Login</Link>
                <Link to="/login/seller" className="auth-link">Seller Login</Link>
              </div>
              <Link to="/register" className="btn-premium">
                <span>Join Now</span>
                <Zap size={16} className="zap-icon" />
              </Link>
            </>
          ) : (
            <div className="user-profile-menu">
              <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-icon-only" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
          {!isAuthenticated && (
            <div className="mobile-auth-section">
              <Link to="/login/buyer" className="mobile-nav-item">Buyer Login</Link>
              <Link to="/login/seller" className="mobile-nav-item">Seller Login</Link>
              <Link to="/register" className="btn-premium mobile-btn">Start Building</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;