// client/src/pages/Registration.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // 1. ایمپورت کردن axios

const Registration = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // استیت برای نمایش خطا به کاربر
  const navigate = useNavigate();

  // 2. جایگزینی تابع fake با تابع واقعی برای ارسال به بک‌اند
  const handleRegister = async (e) => {
    e.preventDefault(); // جلوگیری از رفرش شدن صفحه
    setError(''); // پاک کردن خطای قبلی

    // آدرس API بک‌اند شما
    // این آدرس باید با آدرسی که در بک‌اند تعریف می‌کنید مطابقت داشته باشد
    const API_URL = 'http://localhost:3001/api/auth/register'; 

    try {
      // 3. ساختن یک آبجکت از داده‌های فرم
      const newUser = {
        username,
        name,
        email,
        password,
      };

      // 4. ارسال درخواست POST به سرور
      const response = await axios.post(API_URL, newUser);

      // اگر ثبت‌نام موفق بود
      console.log('Registration successful!', response.data);

      // انتقال کاربر به صفحه لاگین یا داشبورد
      navigate('/join');

    } catch (err) {
      // 5. مدیریت خطا
      console.error('Registration failed:', err.response ? err.response.data : err.message);
      // تنظیم پیام خطا برای نمایش به کاربر
      setError(err.response ? err.response.data.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {/* 6. استفاده از تابع جدید در فرم */}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text" id="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text" id="name" value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* نمایش پیام خطا در صورت وجود */}
          {error && <p className="error-message">{error}</p>}
          
          <div className="button-group">
            <button type="submit" className="auth-button">
              REGISTER
            </button>
          </div>
        </form>
         <div className="switch-auth">
          <p>
            Already have an account? <Link to="/join">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;