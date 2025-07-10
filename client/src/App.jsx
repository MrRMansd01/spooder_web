import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// وارد کردن تمام کامپوننت‌های صفحات
import Join from './pages/Join';
import Registration from './pages/Registration';
import Home from './pages/Home';
import Room from './pages/Room';
import Calendar from './pages/Calendar';
import ChatHome from './pages/ChatHome';
import ChatRoom from './pages/ChatRoom';
import Accent from './pages/Accent';
import MyAccount from './pages/MyAccount';
import SavedBeneficiary from './pages/SavedBeneficiary';
import AboutApp from './pages/AboutApp';

// وارد کردن استایل‌های عمومی برنامه
import './App.css';

// یک کامپوننت ساده برای محافظت از مسیرهای خصوصی
const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('supabaseSession');
  return isLoggedIn ? children : <Navigate to="/join" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* مسیرهای عمومی */}
          <Route path="/join" element={<Join />} />
          <Route path="/register" element={<Registration />} />

          {/* مسیرهای خصوصی که نیاز به لاگین دارند */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/room" element={<PrivateRoute><Room /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatHome /></PrivateRoute>} />
          <Route path="/chat/:channelId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          <Route path="/accent" element={<PrivateRoute><Accent /></PrivateRoute>} />
          <Route path="/my-account" element={<PrivateRoute><MyAccount /></PrivateRoute>} />
          <Route path="/saved-beneficiary" element={<PrivateRoute><SavedBeneficiary /></PrivateRoute>} />
          <Route path="/about-app" element={<PrivateRoute><AboutApp /></PrivateRoute>} />
          
          {/* مسیر پیش‌فرض */}
          <Route path="/" element={<Navigate to="/join" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;