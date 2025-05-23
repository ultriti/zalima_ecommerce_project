import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">E-Commerce</Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/user/profile">Profile</Link></li>
          </ul>
        </nav>
        <div className="header-actions">
          <Link to="/user/signin" className="btn-login">Login</Link>
          <Link to="/user/signup" className="btn-register">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;