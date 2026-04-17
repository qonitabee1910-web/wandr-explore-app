import { supabase } from '@/lib/supabase';

/**
 * Driver App Service
 * Handles real-time operations for the Driver application
 */

export const driverAppService = {
  /**
   * Initialize or get driver profile in the drivers table
   */
  async initializeDriver(userId: string) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Driver not found, create one
        const { data: newData, error: insertError } = await supabase
          .from('drivers')
          .insert([{ id: userId }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return { success: true, data: newData };
      }

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[DriverAppService] initializeDriver Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Gagal inisialisasi driver' };
    }
  },

  /**
   * Toggle online/offline status
   */
  async toggleOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({ 
          is_online: isOnline, 
          status: isOnline ? 'available' : 'offline',
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[DriverAppService] toggleOnlineStatus Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Gagal mengubah status' };
    }
  },

  /**
   * Update driver location
   */
  async updateLocation(userId: string, lat: number, lng: number) {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_latitude: lat, 
          current_longitude: lng, 
          last_location_update: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[DriverAppService] updateLocation Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Gagal update lokasi' };
    }
  },

  /**
   * Listen for new ride requests
   */
  subscribeToRideRequests(driverId: string, callback: (payload: any) => void) {
    // In a real app, we might filter by proximity or driver eligibility
    // For now, we subscribe to 'requested' rides
    return supabase
      .channel('ride_requests')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'rides',
          filter: `status=eq.requested` 
        }, 
        (payload) => callback(payload)
      )
      .subscribe();
  },

  /**
   * Accept a ride
   */
  async acceptRide(rideId: string, driverId: string) {
    try {
      // Use a transaction-like approach: check if still requested then update
      const { data: ride } = await supabase
        .from('rides')
        .select('status')
        .eq('id', rideId)
        .single();

      if (ride?.status !== 'requested') {
        throw new Error('Pesanan sudah diambil oleh driver lain atau dibatalkan');
      }

      const { data, error } = await supabase
        .from('rides')
        .update({ 
          driver_id: driverId, 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      
      // Update driver status to busy
      await supabase
        .from('drivers')
        .update({ status: 'busy' })
        .eq('id', driverId);

      return { success: true, data };
    } catch (error) {
      console.error('[DriverAppService] acceptRide Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Gagal menerima pesanan' };
    }
  },

  /**
   * Reject a ride (Local only or update tracking)
   */
  async rejectRide(rideId: string, driverId: string, reason?: string) {
    // In a real system, we might track rejection for the response rate
    // For this implementation, we'll just log it
    console.log(`Driver ${driverId} rejected ride ${rideId}. Reason: ${reason}`);
    return { success: true };
  },

  /**
   * Start trip
   */
  async startTrip(rideId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ 
          status: 'started',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Gagal memulai perjalanan' };
    }
  },

  /**
   * Complete trip
   */
  async completeTrip(rideId: string, driverId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;

      // Update driver stats
      const { data: driver } = await supabase
        .from('drivers')
        .select('total_earnings, completed_trips')
        .eq('id', driverId)
        .single();

      await supabase
        .from('drivers')
        .update({ 
          status: 'available',
          completed_trips: (driver?.completed_trips || 0) + 1,
          total_earnings: (driver?.total_earnings || 0) + (data.total_fare || 0)
        })
        .eq('id', driverId);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Gagal menyelesaikan perjalanan' };
    }
  }
};
