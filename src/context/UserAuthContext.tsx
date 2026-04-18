import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

interface UserAuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('full_name, phone, avatar_url').eq('id', authUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', authUser.id),
    ]);

    setUser({
      id: authUser.id,
      email: authUser.email || '',
      fullName: profile?.full_name || authUser.user_metadata?.full_name || '',
      phone: profile?.phone || authUser.user_metadata?.phone || '',
      avatar: profile?.avatar_url || undefined,
    });
    setIsAuthenticated(true);
    setIsAdmin((roles ?? []).some((r) => r.role === 'admin'));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTimeout(() => loadProfile(session.user), 0);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await loadProfile(authUser);
  };

  return (
    <UserAuthContext.Provider value={{ user, isLoading, isAuthenticated, isAdmin, error, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuth must be used within UserAuthProvider');
  return context;
};
