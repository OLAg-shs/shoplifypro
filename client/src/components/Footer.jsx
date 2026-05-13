import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo" style={{ color: 'white', marginBottom: '1.5rem' }}>
            <ShoppingBag size={28} style={{ color: 'var(--primary-accent)' }} />
            Eagle Choice
          </Link>
          <p>
            The world's most advanced multi-vendor e-commerce platform. 
            Empowering sellers to build empires and buyers to discover excellence.
          </p>
        </div>

        <div className="footer-column">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/register">Become a Seller</Link></li>
            <li><Link to="/login/buyer">Shop Marketplace</Link></li>
            <li><Link to="/store-builder">Store Builder</Link></li>
            <li><Link to="/card-generator">Ad Generator</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blog">Our Blog</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
            <li><Link to="/security">Security</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Eagle Choice Corp. All rights reserved.</p>
        <div className="footer-socials">
          <a href="#"><Twitter size={20} /></a>
          <a href="#"><Github size={20} /></a>
          <a href="#"><Linkedin size={20} /></a>
          <a href="#"><Facebook size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;