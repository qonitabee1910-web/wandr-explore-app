/**
 * Admin Topbar/Header
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import './Topbar.css';

interface TopbarProps {
  userName?: string;
  userRole?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ userName = 'Admin User', userRole = 'Super Admin' }) => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const handleNotificationClick = () => {
    // Navigate to notifications page
    navigate('/admin/notifications');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Implement theme toggle logic
    document.body.classList.toggle('dark-mode');
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Left section - Search/Title */}
        <div className="topbar-left">
          <h1 className="page-title">Dashboard</h1>
        </div>

        {/* Right section - Actions */}
        <div className="topbar-right">
          {/* Theme toggle */}
          <button
            className="topbar-button"
            onClick={toggleTheme}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="notification-container">
            <button
              className="topbar-button"
              onClick={handleNotificationClick}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications > 9 ? '9+' : notifications}</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="topbar-divider" />

          {/* User menu */}
          <div className="user-menu">
            <button
              className="user-menu-trigger"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">{userRole}</div>
              </div>
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="user-menu-overlay"
                  onClick={() => setIsUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="user-menu-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-avatar">
                      <User size={24} />
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{userName}</div>
                      <div className="dropdown-user-role">{userRole}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button className="dropdown-item">
                    <Settings size={18} />
                    <span>Profile Settings</span>
                  </button>

                  <button className="dropdown-item">
                    <Bell size={18} />
                    <span>Preferences</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
