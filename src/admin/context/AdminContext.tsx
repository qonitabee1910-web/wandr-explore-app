/**
 * Admin Context
 * Global state management for admin dashboard
 * Provides admin authentication, user info, and permissions
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth, AdminUser } from '../hooks/useAdminAuth';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  error: string | null;
  canAccess: (permission: string) => boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: React.ReactNode;
}

/**
 * Admin Context Provider
 * Wrap your admin routes with this provider
 */
export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const authData = useAdminAuth();

  return (
    <AdminContext.Provider value={authData}>
      {children}
    </AdminContext.Provider>
  );
};

/**
 * Hook to use Admin Context
 * Must be called inside AdminProvider
 */
export const useAdminContext = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
};

/**
 * Protected Admin Page Component
 * Wraps pages that require admin access
 * Automatically redirects if not admin
 */
export interface ProtectedPageProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedAdminPage: React.FC<ProtectedPageProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAdmin, isLoading, canAccess, user } = useAdminContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '14px',
          color: '#6b7280',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Save the attempted path to redirect back after login if possible
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !canAccess(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * CSS for loading spinner animation
 * Add to your global styles or page CSS
 */
const spinnerStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('admin-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}
