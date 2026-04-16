/**
 * Supabase Admin Client
 * Centralized connection to Supabase for admin dashboard
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not configured in environment');
}

/**
 * Supabase client instance
 * Use this for all admin dashboard database operations
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

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
    // Optional: Add admin role check here
    return session;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Export types for type safety across services
 */
export type { PostgrestError } from '@supabase/supabase-js';
