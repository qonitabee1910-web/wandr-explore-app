/**
 * Ride Monitoring Service
 * Handle ride tracking and monitoring operations
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { Ride, RideTracking, RideFilter, PaginatedResponse, ApiResponse } from '../types';

export const rideService = {
  /**
   * Get all rides with pagination and filters
   */
  async getRides(filters: RideFilter = {}): Promise<ApiResponse<PaginatedResponse<Ride>>> {
    try {
      let query = supabase.from('rides').select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`driver_id.ilike.%${filters.search}%,passenger_id.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.rideType) {
        query = query.eq('ride_type', filters.rideType);
      }

      if (filters.minFare !== undefined) {
        query = query.gte('total_fare', filters.minFare);
      }

      if (filters.maxFare !== undefined) {
        query = query.lte('total_fare', filters.maxFare);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as Ride[],
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
   * Get a single ride by ID
   */
  async getRide(rideId: string): Promise<ApiResponse<Ride>> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Ride,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get ride tracking information
   */
  async getRideTracking(rideId: string): Promise<ApiResponse<RideTracking>> {
    try {
      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select('driver_id, status')
        .eq('id', rideId)
        .single();

      if (rideError) throw rideError;

      // Get driver info
      const { data: driverData, error: driverError } = await supabase
        .from('users')
        .select('full_name, rating')
        .eq('id', rideData.driver_id)
        .single();

      if (driverError) throw driverError;

      // In a real scenario, you'd fetch real-time location from a separate table
      // For now, returning mock data structure
      const tracking: RideTracking = {
        ride_id: rideId,
        driver_location: {
          latitude: 0,
          longitude: 0,
          address: 'Fetching location...',
        },
        driver_name: driverData.full_name,
        driver_rating: driverData.rating,
        vehicle_info: 'Vehicle info from ride data',
        estimated_arrival: 600, // in seconds
        distance_to_destination: 5.2, // in km
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: tracking,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get active rides (in progress)
   */
  async getActiveRides(limit: number = 50): Promise<ApiResponse<Ride[]>> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'in_progress')
        .order('started_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data as Ride[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get ride statistics for a date range
   */
  async getRideStats(startDate: string, endDate: string): Promise<
    ApiResponse<{
      totalRides: number;
      completedRides: number;
      canceledRides: number;
      totalRevenue: number;
      averageRating: number;
      averageFare: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const rides = data || [];
      const completed = rides.filter((r) => r.status === 'completed');
      const canceled = rides.filter((r) => r.status === 'cancelled');
      const ratings = completed.filter((r) => r.passenger_rating).map((r) => Number(r.passenger_rating));

      const stats = {
        totalRides: rides.length,
        completedRides: completed.length,
        canceledRides: canceled.length,
        totalRevenue: parseFloat(rides.reduce((sum, r) => sum + (Number(r.total_fare) || 0), 0).toFixed(2)),
        averageRating: ratings.length > 0
          ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
          : 0,
        averageFare: rides.length > 0
          ? parseFloat((rides.reduce((sum, r) => sum + (Number(r.total_fare) || 0), 0) / rides.length).toFixed(2))
          : 0,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Cancel a ride (admin action)
   */
  async cancelRide(rideId: string, reason: string): Promise<ApiResponse<Ride>> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Ride,
        message: 'Ride canceled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Real-time subscription to ride updates
   */
  subscribeToRides(callback: (event: any) => void) {
    return supabase
      .channel('rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, callback)
      .subscribe();
  },
};

export default rideService;
