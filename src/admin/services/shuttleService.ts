/**
 * Shuttle Management Service
 * Handle shuttle, routes, and schedules
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import {
  Shuttle,
  ShuttleRoute,
  ShuttleSchedule,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const shuttleService = {
  /**
   * Get all shuttles
   */
  async getShuttles(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Shuttle>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('shuttles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as Shuttle[],
          total: count || 0,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a new shuttle
   */
  async createShuttle(shuttle: Partial<Shuttle>): Promise<ApiResponse<Shuttle>> {
    try {
      const { data, error } = await supabase
        .from('shuttles')
        .insert(shuttle)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Shuttle,
        message: 'Shuttle created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a shuttle
   */
  async updateShuttle(shuttleId: string, updates: Partial<Shuttle>): Promise<ApiResponse<Shuttle>> {
    try {
      const { data, error } = await supabase
        .from('shuttles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', shuttleId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Shuttle,
        message: 'Shuttle updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Delete a shuttle
   */
  async deleteShuttle(shuttleId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('shuttles').delete().eq('id', shuttleId);

      if (error) throw error;

      return {
        success: true,
        message: 'Shuttle deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get all routes
   */
  async getRoutes(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<ShuttleRoute>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('shuttle_routes')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as ShuttleRoute[],
          total: count || 0,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a new route
   */
  async createRoute(route: Partial<ShuttleRoute>): Promise<ApiResponse<ShuttleRoute>> {
    try {
      const { data, error } = await supabase
        .from('shuttle_routes')
        .insert(route)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ShuttleRoute,
        message: 'Route created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a route
   */
  async updateRoute(routeId: string, updates: Partial<ShuttleRoute>): Promise<ApiResponse<ShuttleRoute>> {
    try {
      const { data, error } = await supabase
        .from('shuttle_routes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', routeId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ShuttleRoute,
        message: 'Route updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get all schedules
   */
  async getSchedules(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<ShuttleSchedule>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('shuttle_schedules')
        .select('*', { count: 'exact' })
        .order('departure_time', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as ShuttleSchedule[],
          total: count || 0,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a new schedule
   */
  async createSchedule(schedule: Partial<ShuttleSchedule>): Promise<ApiResponse<ShuttleSchedule>> {
    try {
      const { data, error } = await supabase
        .from('shuttle_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ShuttleSchedule,
        message: 'Schedule created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a schedule
   */
  async updateSchedule(scheduleId: string, updates: Partial<ShuttleSchedule>): Promise<ApiResponse<ShuttleSchedule>> {
    try {
      const { data, error } = await supabase
        .from('shuttle_schedules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ShuttleSchedule,
        message: 'Schedule updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get shuttle statistics
   */
  async getShuttleStats(): Promise<
    ApiResponse<{
      totalShuttles: number;
      activeShuttles: number;
      totalRoutes: number;
      totalSchedules: number;
    }>
  > {
    try {
      const { count: totalShuttles } = await supabase
        .from('shuttles')
        .select('*', { count: 'exact', head: true });

      const { count: activeShuttles } = await supabase
        .from('shuttles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalRoutes } = await supabase
        .from('shuttle_routes')
        .select('*', { count: 'exact', head: true });

      const { count: totalSchedules } = await supabase
        .from('shuttle_schedules')
        .select('*', { count: 'exact', head: true });

      return {
        success: true,
        data: {
          totalShuttles: totalShuttles || 0,
          activeShuttles: activeShuttles || 0,
          totalRoutes: totalRoutes || 0,
          totalSchedules: totalSchedules || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Real-time subscription to shuttle updates
   */
  subscribeToShuttles(callback: (event: any) => void) {
    return supabase
      .channel('shuttles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shuttles' }, callback)
      .subscribe();
  },
};

export default shuttleService;
