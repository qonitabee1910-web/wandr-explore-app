/**
 * Admin Routes Configuration
 * Complete routing setup for admin dashboard
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import { AdminProvider, ProtectedAdminPage } from './context/AdminContext';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Drivers = lazy(() => import('./pages/Drivers'));
const Rides = lazy(() => import('./pages/Rides'));
const Shuttles = lazy(() => import('./pages/Shuttles'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Promos = lazy(() => import('./pages/Promos'));
const Ads = lazy(() => import('./pages/Ads'));
const Settings = lazy(() => import('./pages/Settings'));
const SeatLayoutEditor = lazy(() => import('./pages/SeatLayoutEditor'));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '14px',
    color: '#6b7280',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span>Loading page...</span>
    </div>
  </div>
);

/**
 * Admin Router Component
 * All admin routes under /admin prefix
 */
export const AdminRouter: React.FC = () => {
  return (
    <AdminProvider>
      <ProtectedAdminPage>
        <Routes>
          {/* Main layout with sidebar and topbar */}
          <Route element={<AdminLayout />}>
            {/* Dashboard */}
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />

            {/* Driver Management */}
            <Route
              path="drivers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Drivers />
                </Suspense>
              }
            />

            {/* Ride Monitoring */}
            <Route
              path="rides"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Rides />
                </Suspense>
              }
            />

            {/* Shuttle Management */}
            <Route
              path="shuttles"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Shuttles />
                </Suspense>
              }
            />

            {/* Pricing Control */}
            <Route
              path="pricing"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Pricing />
                </Suspense>
              }
            />

            {/* Promo Control */}
            <Route
              path="promos"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Promos />
                </Suspense>
              }
            />

            {/* Ads Control */}
            <Route
              path="ads"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Ads />
                </Suspense>
              }
            />

            {/* Settings */}
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              }
            />

            {/* Seat Layout Editor */}
            <Route
              path="layout-editor"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SeatLayoutEditor />
                </Suspense>
              }
            />

            {/* Default route */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch-all for invalid admin routes */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </ProtectedAdminPage>
    </AdminProvider>
  );
};

export default AdminRouter;
