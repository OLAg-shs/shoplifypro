import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Header = () => {
  const navStyle = ({ isActive }) => ({
    color: isActive ? 'white' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    transition: 'color 0.2s ease',
    fontSize: '0.95rem',
  });

  return (
    <nav>
      {/* Logo */}
      <Link
        to="/"
        className="logo"
        style={{
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
        }}
      >
        <Zap size={20} style={{ color: '#6366f1' }} />
        Eagle Choice
      </Link>

      {/* Nav Links */}
      <div className="nav-links">
        <NavLink to="/" end style={navStyle}>Home</NavLink>
        <NavLink to="/seller/dashboard" style={navStyle}>Dashboard</NavLink>
        <NavLink to="/store-builder" style={navStyle}>Store Builder</NavLink>
        <NavLink to="/card-generator" style={navStyle}>Ad Cards</NavLink>
        <NavLink to="/products/manage" style={navStyle}>Products</NavLink>
        <NavLink to="/orders/tracking" style={navStyle}>Orders</NavLink>
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <NavLink
          to="/login"
          style={({ isActive }) => ({
            color: isActive ? 'white' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'color 0.2s ease',
          })}
        >
          Login
        </NavLink>
        <Link
          to="/register"
          className="btn btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.9rem', textDecoration: 'none' }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Header;