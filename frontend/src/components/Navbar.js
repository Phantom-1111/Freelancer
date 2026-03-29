import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ⏱️ TimeTracker
        </Link>

        {token ? (
          <div className="nav-menu">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/clients" className="nav-link">
              Clients
            </Link>
            <Link to="/projects" className="nav-link">
              Projects
            </Link>
            <Link to="/time-tracker" className="nav-link">
              Timer
            </Link>
            <Link to="/invoices" className="nav-link">
              Invoices
            </Link>
            <button onClick={handleLogout} className="nav-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-menu">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
