import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">CyberGuard</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">Technology</a>
          <a href="#" className="nav-cta">Get Started</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
