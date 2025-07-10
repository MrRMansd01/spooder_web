import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // برای ارتباط با بک‌اند

const Join = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ارسال درخواست به API لاگین در بک‌اند
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });

      // در صورت موفقیت، سوپربیس یک session شامل توکن برمی‌گرداند
      // ما این توکن را در مرورگر ذخیره می‌کنیم تا کاربر لاگین بماند
      localStorage.setItem('supabaseSession', JSON.stringify(response.data.session));
      
      // هدایت به صفحه اصلی
      navigate('/home');

    } catch (err) {
      // نمایش خطایی که از سمت سرور می‌آید
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join the Room</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="button-group">
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'JOIN'}
            </button>
          </div>
        </form>
        <div className="switch-auth">
          <p>I don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Join;
