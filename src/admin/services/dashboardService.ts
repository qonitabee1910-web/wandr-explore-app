/**
 * Dashboard Analytics Service
 * Fetch and manage dashboard metrics and analytics
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { DashboardStats, AnalyticsData, ApiResponse } from '../types';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Fetch total rides
      const { count: totalRides } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true });

      // Fetch total shuttles
      const { count: totalShuttles } = await supabase
        .from('shuttles')
        .select('*', { count: 'exact', head: true });

      // Fetch total drivers
      const { count: totalDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      // Fetch active users (users with rides in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('rides')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      // Fetch total revenue
      const { data: rideData } = await supabase
        .from('rides')
        .select('fare')
        .eq('status', 'completed');

      const totalRevenue = (rideData || []).reduce((sum, ride) => sum + (ride.fare || 0), 0);

      // Fetch completed rides
      const { count: completedRides } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch pending approvals (drivers)
      const { count: pendingApprovals } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch canceled rides
      const { count: canceledRides } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'canceled');

      const stats: DashboardStats = {
        totalRides: totalRides || 0,
        totalShuttles: totalShuttles || 0,
        totalDrivers: totalDrivers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        completedRides: completedRides || 0,
        pendingApprovals: pendingApprovals || 0,
        canceledRides: canceledRides || 0,
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
   * Get analytics data for charts (rides and revenue over time)
   */
  async getAnalyticsData(days: number = 7): Promise<ApiResponse<AnalyticsData[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('rides')
        .select('created_at, fare')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group data by date
      const groupedData = new Map<string, { rides: number; revenue: number }>();

      (data || []).forEach((ride) => {
        const date = new Date(ride.created_at).toISOString().split('T')[0];
        const current = groupedData.get(date) || { rides: 0, revenue: 0 };
        groupedData.set(date, {
          rides: current.rides + 1,
          revenue: current.revenue + (ride.fare || 0),
        });
      });

      const analytics: AnalyticsData[] = Array.from(groupedData.entries()).map(([date, stats]) => ({
        date,
        rides: stats.rides,
        revenue: parseFloat(stats.revenue.toFixed(2)),
        users: 0, // Would be calculated from user table if needed
        shuttles: 0, // Would be calculated from shuttles table if needed
      }));

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get ride metrics
   */
  async getRideMetrics(): Promise<ApiResponse<any>> {
    try {
      const { data: rideData, error } = await supabase
        .from('rides')
        .select('status, fare, rating, created_at, started_at');

      if (error) throw error;

      const rides = rideData || [];
      const completedRides = rides.filter((r) => r.status === 'completed');
      const canceledRides = rides.filter((r) => r.status === 'canceled');
      const ratings = completedRides
        .filter((r) => r.rating)
        .map((r) => r.rating);

      const metrics = {
        totalRides: rides.length,
        completedRides: completedRides.length,
        canceledRides: canceledRides.length,
        cancelRate: rides.length > 0 ? ((canceledRides.length / rides.length) * 100).toFixed(2) : 0,
        averageRating: ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
          : 0,
        averageFare: rides.length > 0
          ? (rides.reduce((sum, r) => sum + (r.fare || 0), 0) / rides.length).toFixed(2)
          : 0,
      };

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get real-time stats updates
   */
  subscribeToStats(callback: (stats: DashboardStats) => void) {
    const ridesSub = supabase
      .channel('rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, async () => {
        const response = await this.getStats();
        if (response.data) {
          callback(response.data);
        }
      })
      .subscribe();

    const driversSub = supabase
      .channel('drivers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, async () => {
        const response = await this.getStats();
        if (response.data) {
          callback(response.data);
        }
      })
      .subscribe();

    return {
      unsubscribe: () => {
        ridesSub.unsubscribe();
        driversSub.unsubscribe();
      },
    };
  },
};

export default dashboardService;
