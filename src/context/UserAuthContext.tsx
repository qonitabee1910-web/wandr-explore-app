/**
 * User Authentication Context
 * Global state management for user authentication
 * Manages user session, authentication state, and profile data
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, onAuthStateChange } from '@/lib/supabase';
import { AuthUser } from '@/services/authService';

interface UserAuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

interface UserAuthProviderProps {
  children: React.ReactNode;
}

/**
 * User Auth Provider
 * Wrap your app with this provider to enable user authentication
 */
export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authUser) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Fetch user profile from database
      let userProfile = null;
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        // If profile doesn't exist (404), try to create it
        if (profileError.code === 'PGRST116') {
          try {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: (authUser.email || '').toLowerCase(),
                full_name: authUser.user_metadata?.full_name || '',
                phone_number: authUser.user_metadata?.phone,
                role: 'user',
                status: 'active',
              });

            if (createError) {
              // 23505 = duplicate key (race condition, already created)
              if (createError.code !== '23505') {
                console.warn('Could not create profile:', createError);
              }
            }
          } catch (err) {
            console.warn('Profile creation failed:', err);
            // Continue without profile - user data from auth is enough
          }
        } else {
          // Other errors - log but don't block auth
          console.warn('Profile fetch error:', profileError);
        }
      } else {
        userProfile = profileData;
      }

      const userObj: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        fullName: userProfile?.full_name || authUser.user_metadata?.full_name,
        phone: userProfile?.phone_number || authUser.user_metadata?.phone,
        avatar: userProfile?.profile_picture_url,
        role: userProfile?.role || 'user',
      };

      setUser(userObj);
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    fetchUserProfile();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (!session) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        fetchUserProfile();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    }
  };

  const refreshUser = async () => {
    await fetchUserProfile();
  };

  const value: UserAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    logout,
    refreshUser,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

/**
 * Hook to use User Auth Context
 * Must be called inside UserAuthProvider
 */
export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};
