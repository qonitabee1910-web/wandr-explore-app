/**
 * Supabase Admin Client
 * Centralized connection to Supabase for admin dashboard
 * Re-exports from global supabase client to avoid multiple instances
 */

import { supabase } from '@/lib/supabase';

/**
 * Supabase client instance
 * Use this for all admin dashboard database operations
 */
export { supabase };

/**
 * Helper to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Helper to check admin authentication
 */
export const checkAdminAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Export types for type safety across services
 */
export type { PostgrestError } from '@supabase/supabase-js';
