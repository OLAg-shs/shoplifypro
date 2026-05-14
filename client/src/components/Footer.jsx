import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Linkedin, Facebook, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #38bdf8)' }}>
                <ShoppingBag size={24} />
              </div>
              <span style={{ 
                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}>Eagle Choice</span>
            </Link>
            <p className="footer-description">
              The definitive multi-vendor operating system. We provide the infrastructure for the next generation of global commerce empires.
            </p>
            <div className="footer-contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>support@eaglechoice.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 000-8888</span>
              </div>
            </div>
          </div>

          <div className="footer-nav">
            <div className="footer-column">
              <h4>Ecosystem</h4>
              <ul>
                <li><Link to="/register">Seller Central</Link></li>
                <li><Link to="/login/buyer">Marketplace</Link></li>
                <li><Link to="/store-builder">AI Store Builder</Link></li>
                <li><Link to="/card-generator">Ad Generator</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/docs">Documentation</Link></li>
                <li><Link to="/api">API Reference</Link></li>
                <li><Link to="/community">Community Hub</Link></li>
                <li><Link to="/partners">Partner Program</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Governance</h4>
              <ul>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Protocol</Link></li>
                <li><Link to="/security">Security Center</Link></li>
                <li><Link to="/compliance">Compliance</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} Eagle Choice Corp. <span className="version">v2.4.0-pro</span></p>
          </div>
          
          <div className="footer-socials">
            <a href="#" aria-label="Twitter" className="social-link"><Twitter size={18} /></a>
            <a href="#" aria-label="GitHub" className="social-link"><Github size={18} /></a>
            <a href="#" aria-label="LinkedIn" className="social-link"><Linkedin size={18} /></a>
            <a href="#" aria-label="Facebook" className="social-link"><Facebook size={18} /></a>
          </div>

          <div className="footer-status">
            <div className="status-indicator"></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;