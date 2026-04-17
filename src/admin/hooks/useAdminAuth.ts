/**
 * Admin Authentication Hook
 * Check admin authentication status and permissions
 * Verifies user role and provides admin context
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  permissions: string[];
  createdAt: string;
}

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  error: string | null;
  canAccess: (permission: string) => boolean;
  checkPermission: (permission: string) => boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

/**
 * Hook to check admin authentication and permissions
 * Must be called within a React component
 *
 * Usage:
 * ```typescript
 * const { isAdmin, isLoading, user, canAccess } = useAdminAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAdmin) return <AccessDenied />;
 *
 * if (canAccess('drivers:approve')) {
 *   // Show approval button
 * }
 * ```
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin user details
  const fetchAdminUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authUser) {
        setIsAdmin(false);
        setUser(null);
        return;
      }

      // Check if user is admin from users table (secure approach)
      // Role stored in users table, NOT user_metadata (which is user-editable)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, full_name, permissions')
        .eq('id', authUser.id)
        .single();

      // Handle case where profile doesn't exist yet
      if (profileError && profileError.code === 'PGRST116') {
        setIsAdmin(false);
        setUser(null);
        setError('User profile not found. Please log in again.');
        return;
      }

      if (profileError || !userProfile) {
        setIsAdmin(false);
        setUser(null);
        setError(profileError?.message || 'Could not verify admin status');
        return;
      }

      // Check if user has admin role
      const adminRole = userProfile.role;
      const isAdminUser = adminRole && ['admin', 'super_admin', 'moderator'].includes(adminRole);
      
      if (!isAdminUser) {
        setIsAdmin(false);
        setUser(null);
        setError('User is not an admin');
        return;
      }

      // User is admin - set admin state
      setIsAdmin(true);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile.full_name,
        role: adminRole as 'admin' | 'super_admin' | 'moderator' | 'analyst',
        permissions: userProfile.permissions || [],
        createdAt: authUser.created_at || new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify admin status';
      setError(message);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to auth changes
  useEffect(() => {
    fetchAdminUser();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAdmin(false);
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchAdminUser();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchAdminUser]);

  // Check if user has specific permission
  const checkPermission = useCallback((permission: string): boolean => {
    if (!isAdmin || !user) return false;

    // Full admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    return user.permissions.includes(permission);
  }, [isAdmin, user]);

  const canAccess = checkPermission;

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  // Refresh auth status
  const refreshAuth = useCallback(async () => {
    await fetchAdminUser();
  }, [fetchAdminUser]);

  return {
    isAdmin,
    isLoading,
    user,
    error,
    canAccess,
    checkPermission,
    logout,
    refreshAuth,
  };
}

/**
 * Default admin permissions
 * Can be customized based on role/level
 */
function getDefaultAdminPermissions(): string[] {
  return [
    // Dashboard
    'dashboard:view',
    'analytics:view',
    'reports:view',

    // Drivers
    'drivers:view',
    'drivers:approve',
    'drivers:reject',
    'drivers:suspend',
    'drivers:view-documents',

    // Rides
    'rides:view',
    'rides:cancel',
    'rides:dispute',
    'rides:track',

    // Shuttles
    'shuttles:view',
    'shuttles:create',
    'shuttles:edit',
    'shuttles:delete',
    'routes:view',
    'routes:manage',
    'schedules:view',
    'schedules:manage',

    // Pricing
    'pricing:view',
    'pricing:edit',
    'surge:view',
    'surge:edit',
    'fares:view',
    'fares:edit',

    // Promos
    'promos:view',
    'promos:create',
    'promos:edit',
    'promos:delete',
    'promos:manage-codes',

    // Ads
    'ads:view',
    'ads:create',
    'ads:edit',
    'ads:delete',

    // Settings
    'settings:view',
    'settings:edit',
    'audit-logs:view',
    'system:manage',

    // Support
    'tickets:view',
    'tickets:respond',
    'tickets:resolve',
  ];
}

/**
 * Permission constants for easy reference
 */
export const AdminPermissions = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  ANALYTICS_VIEW: 'analytics:view',
  REPORTS_VIEW: 'reports:view',

  // Drivers
  DRIVERS_VIEW: 'drivers:view',
  DRIVERS_APPROVE: 'drivers:approve',
  DRIVERS_REJECT: 'drivers:reject',
  DRIVERS_SUSPEND: 'drivers:suspend',
  DRIVERS_VIEW_DOCUMENTS: 'drivers:view-documents',

  // Rides
  RIDES_VIEW: 'rides:view',
  RIDES_CANCEL: 'rides:cancel',
  RIDES_DISPUTE: 'rides:dispute',
  RIDES_TRACK: 'rides:track',

  // Shuttles
  SHUTTLES_VIEW: 'shuttles:view',
  SHUTTLES_CREATE: 'shuttles:create',
  SHUTTLES_EDIT: 'shuttles:edit',
  SHUTTLES_DELETE: 'shuttles:delete',

  // Routes
  ROUTES_VIEW: 'routes:view',
  ROUTES_MANAGE: 'routes:manage',

  // Schedules
  SCHEDULES_VIEW: 'schedules:view',
  SCHEDULES_MANAGE: 'schedules:manage',

  // Pricing
  PRICING_VIEW: 'pricing:view',
  PRICING_EDIT: 'pricing:edit',
  SURGE_VIEW: 'surge:view',
  SURGE_EDIT: 'surge:edit',

  // Promos
  PROMOS_VIEW: 'promos:view',
  PROMOS_CREATE: 'promos:create',
  PROMOS_EDIT: 'promos:edit',
  PROMOS_DELETE: 'promos:delete',

  // Ads
  ADS_VIEW: 'ads:view',
  ADS_CREATE: 'ads:create',
  ADS_EDIT: 'ads:edit',
  ADS_DELETE: 'ads:delete',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SYSTEM_MANAGE: 'system:manage',
} as const;
