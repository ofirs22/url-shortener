import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken')
  };

    // useEffect to check the authentication status when the component mounts
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
        {!isLoggedIn ? (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/signup" style={styles.link}>
              Sign Up
            </Link>
          </>
        ) : <Link to="/urls" style={styles.link}>
            URL's
        </Link>}
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
            <button style={styles.button}>Sign Up</button>
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
