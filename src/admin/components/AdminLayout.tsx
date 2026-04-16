/**
 * Admin Layout
 * Main layout wrapper for admin pages
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AdminLayout.css';

interface AdminLayoutProps {
  userName?: string;
  userRole?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  userName = 'Admin User',
  userRole = 'Super Admin',
}) => {
  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <Topbar userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className="admin-content">
          <div className="admin-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
