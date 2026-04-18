import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '@/context/UserAuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useUserAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};
