import React, { useState } from 'react';
import axios from 'axios' ;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Send POST request to the backend API to log in
      const response = await axios.post('http://localhost:3080/api/v1/auth/login', {
        email,
        password,
      });

      // Handle success - you can store the token or user info in local storage
      console.log('Login successful:', response.data);

      // Example: Store JWT in localStorage or sessionStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem("userId", response.data.user.id)
      // Redirect user after successful login (you can use react-router for this)
      window.location.href = '/'; // For example, redirect to the dashboard

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError('Invalid credentials or server error');
      console.error('Login error:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className="text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="text-center mt-3">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default LoginPage;
