import { supabase } from '@/lib/supabase';

/**
 * Database Service - Handles all Supabase queries
 * Provides a clean abstraction layer for data access
 */

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
      };
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  },
};

// ============================================================================
// RIDES SERVICE
// ============================================================================

export const rideService = {
  async createRide(rideData: any) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ride',
      };
    }
  },

  async getUserRides(userId: string, userType: 'passenger' | 'driver' = 'passenger') {
    try {
      const column = userType === 'passenger' ? 'passenger_id' : 'driver_id';
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rides',
      };
    }
  },

  async getRideDetails(rideId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ride details',
      };
    }
  },

  async updateRideStatus(rideId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ride status',
      };
    }
  },

  async trackRideLocation(rideId: string, latitude: number, longitude: number) {
    try {
      const { data, error } = await supabase
        .from('ride_locations')
        .insert([
          {
            ride_id: rideId,
            latitude,
            longitude,
            recorded_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track location',
      };
    }
  },

  async rateRide(rideId: string, ratedById: string, rating: number, rateType: 'driver' | 'passenger') {
    try {
      const table = rateType === 'driver' ? 'driver_ratings' : 'passenger_ratings';
      const ride = await this.getRideDetails(rideId);

      if (!ride.success) throw new Error('Ride not found');

      const { data, error } = await supabase
        .from(table)
        .insert([
          {
            [rateType === 'driver' ? 'driver_id' : 'passenger_id']: 
              rateType === 'driver' ? ride.data.driver_id : ride.data.passenger_id,
            [rateType === 'driver' ? 'passenger_id' : 'driver_id']: ratedById,
            ride_id: rideId,
            rating,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rate ride',
      };
    }
  },
};

// ============================================================================
// SHUTTLE SERVICE
// ============================================================================

export const shuttleService = {
  async getShuttleRoutes() {
    try {
      const { data, error } = await supabase
        .from('shuttle_routes')
        .select('*, shuttle_stops(*)')
        .eq('is_active', true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch routes',
      };
    }
  },

  async getShuttleSchedules(routeId: string) {
    try {
      const { data, error } = await supabase
        .from('shuttle_schedules')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
      };
    }
  },

  async bookShuttle(scheduleId: string, userId: string, numberOfSeats: number) {
    try {
      const bookingReference = `PYU-${Date.now()}`;
      const { data, error } = await supabase
        .from('shuttle_bookings')
        .insert([
          {
            schedule_id: scheduleId,
            user_id: userId,
            booking_date: new Date().toISOString().split('T')[0],
            number_of_seats: numberOfSeats,
            booking_reference: bookingReference,
            status: 'confirmed',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book shuttle',
      };
    }
  },

  async getUserShuttleBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('shuttle_bookings')
        .select('*, shuttle_schedules(*, shuttle_routes(*))')
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      };
    }
  },

  async cancelShuttleBooking(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('shuttle_bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      };
    }
  },
};

// ============================================================================
// PROMOS SERVICE
// ============================================================================

export const promoService = {
  async getActivePromos() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('status', 'active')
        .lte('valid_from', now)
        .gte('valid_to', now);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch promos',
      };
    }
  },

  async validatePromoCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid promo code',
      };
    }
  },

  async usePromo(promoId: string, userId: string, rideId: string, discountAmount: number) {
    try {
      const { data, error } = await supabase
        .from('promo_usage')
        .insert([
          {
            promo_id: promoId,
            user_id: userId,
            ride_id: rideId,
            discount_amount: discountAmount,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply promo',
      };
    }
  },
};

// ============================================================================
// PRICING SERVICE
// ============================================================================

export const pricingService = {
  async getPricingRules(serviceType: string) {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('service_type', serviceType)
        .eq('is_active', true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pricing rules',
      };
    }
  },

  async getSurgeMultiplier(latitude: number, longitude: number) {
    try {
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

      const { data, error } = await supabase
        .from('surge_multipliers')
        .select('multiplier')
        .eq('is_active', true)
        .order('multiplier', { ascending: false })
        .limit(1);

      if (error) throw error;
      return { success: true, data: data?.[0]?.multiplier || 1.0 };
    } catch (error) {
      return {
        success: false,
        data: 1.0,
      };
    }
  },
};

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const transactionService = {
  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTransaction(data: any) {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return transaction;
  },
};

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export const supportService = {
  async createTicket(data: any) {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return ticket;
  },

  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
