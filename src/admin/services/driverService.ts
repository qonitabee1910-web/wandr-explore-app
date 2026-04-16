/**
 * Driver Management Service
 * Handle all driver-related operations
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { Driver, DriverApprovalRequest, PaginatedResponse, DriverFilter, ApiResponse } from '../types';

export const driverService = {
  /**
   * Get all drivers with pagination and filters
   */
  async getDrivers(filters: DriverFilter): Promise<ApiResponse<PaginatedResponse<Driver>>> {
    try {
      let query = supabase.from('drivers').select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.approvalStatus) {
        query = query.eq('status', filters.approvalStatus);
      }

      if (filters.vehicleType) {
        query = query.eq('vehicle_type', filters.vehicleType);
      }

      if (filters.rating) {
        query = query.gte('rating', filters.rating);
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
          data: data as Driver[],
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
   * Get a single driver by ID
   */
  async getDriver(driverId: string): Promise<ApiResponse<Driver>> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Driver,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Approve a driver
   */
  async approveDriver(request: DriverApprovalRequest): Promise<ApiResponse<Driver>> {
    try {
      const { data: adminUser } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('drivers')
        .update({
          status: request.approved ? 'approved' : 'rejected',
          approval_date: new Date().toISOString(),
          approved_by: adminUser?.user?.id,
        })
        .eq('id', request.driver_id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Driver,
        message: request.approved ? 'Driver approved successfully' : 'Driver rejected successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Suspend/unsuspend a driver
   */
  async updateDriverStatus(
    driverId: string,
    status: 'suspended' | 'approved' | 'inactive'
  ): Promise<ApiResponse<Driver>> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Driver,
        message: `Driver status updated to ${status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get pending driver approvals
   */
  async getPendingApprovals(limit: number = 10): Promise<ApiResponse<Driver[]>> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data as Driver[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get driver statistics
   */
  async getDriverStats(): Promise<
    ApiResponse<{
      totalDrivers: number;
      approvedDrivers: number;
      pendingDrivers: number;
      suspendedDrivers: number;
      rideDrivers: number;
      shuttleDrivers: number;
    }>
  > {
    try {
      const statuses = ['approved', 'pending', 'suspended'];
      const stats: any = {
        totalDrivers: 0,
        approvedDrivers: 0,
        pendingDrivers: 0,
        suspendedDrivers: 0,
      };

      for (const status of statuses) {
        const { count } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);

        if (status === 'approved') stats.approvedDrivers = count || 0;
        if (status === 'pending') stats.pendingDrivers = count || 0;
        if (status === 'suspended') stats.suspendedDrivers = count || 0;
      }

      const { count: rideCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('vehicle_type', 'ride');

      const { count: shuttleCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('vehicle_type', 'shuttle');

      stats.totalDrivers = (stats.approvedDrivers || 0) + (stats.pendingDrivers || 0) + (stats.suspendedDrivers || 0);
      stats.rideDrivers = rideCount || 0;
      stats.shuttleDrivers = shuttleCount || 0;

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
   * Real-time subscription to driver updates
   */
  subscribeToDrivers(callback: (event: any) => void) {
    return supabase
      .channel('drivers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, callback)
      .subscribe();
  },
};

export default driverService;
