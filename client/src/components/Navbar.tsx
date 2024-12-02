import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulating login logic
    navigate('/login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    navigate('/'); // Navigate to the home page after logout
  };

  const handleSignup = () => {
    navigate('/signup'); // Navigate to the signup page
  };

  useEffect(() => {
    // Check if the JWT token exists in localStorage (or sessionStorage)
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token); // Set true if token exists, false otherwise
  }, []); // Empty dependency array means this runs once after the initial render

  return (
    <div style={styles.navbar}>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        {isLoggedIn && (
          <Link to="/urls" style={styles.link}>
            URL's
          </Link>
        )}
      </div>
      <div style={styles.authButtons}>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        ) : (
          <>
            <button onClick={handleLogin} style={styles.button}>
              Login
            </button>
            <button onClick={handleSignup} style={styles.button}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#333',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLinks: {
    display: 'flex',
  },
  link: {
    color: 'white',
    padding: '10px',
    textDecoration: 'none',
  },
  authButtons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Navbar;
