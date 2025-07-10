// client/src/components/Footer.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

// --- کامپوننت‌های آیکون SVG ---

const HomeIcon = ({ isActive }) => (
  <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#00664F' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const RoomIcon = ({ isActive }) => (
  <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#00664F' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CalendarIcon = ({ isActive }) => (
  <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#00664F' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ChatIcon = ({ isActive }) => (
  <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#00664F' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const AccentIcon = ({ isActive }) => (
    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#00664F' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);


const Footer = () => {
  const location = useLocation();

  // آرایه آیتم‌ها حالا شامل کامپوننت‌های آیکون است
  const navItems = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/room', label: 'Room', icon: RoomIcon },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/chat', label: 'Chat', icon: ChatIcon },
    { path: '/accent', label: 'Accent', icon: AccentIcon },
  ];

  return (
    <footer className="footer-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon; // خود کامپوننت را دریافت می‌کنیم
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <IconComponent isActive={isActive} /> {/* کامپوننت را رندر کرده و وضعیت فعال بودن را به آن پاس می‌دهیم */}
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </footer>
  );
};

export default Footer;
