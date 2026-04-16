import { supabase } from '@/lib/supabase';
import { Hotel, Ride, Shuttle, Promo, Booking } from '@/types';

/**
 * Database Service - Handles all Supabase queries
 * Provides a clean abstraction layer for data access
 */

// ============================================================================
// HOTELS
// ============================================================================

export const hotelService = {
  async getHotels(city?: string) {
    let query = supabase.from('hotels').select('*');
    
    if (city) {
      query = query.eq('city', city);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Hotel[];
  },

  async getHotel(id: string) {
    const { data, error } = await supabase
      .from('hotels')
      .select('*, hotel_facilities(*), hotel_rooms(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Hotel & { hotel_facilities: any[]; hotel_rooms: any[] };
  },

  async searchHotels(query: string) {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`);
    
    if (error) throw error;
    return data as Hotel[];
  },
};

// ============================================================================
// SHUTTLES
// ============================================================================

export const shuttleService = {
  async getRoutes(origin?: string, destination?: string) {
    let query = supabase.from('shuttle_routes').select('*');
    
    if (origin) query = query.eq('origin_city', origin);
    if (destination) query = query.eq('destination_city', destination);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getSchedules(routeId: string, departureDate?: string) {
    let query = supabase
      .from('shuttle_schedules')
      .select('*, shuttle_routes(*), vehicles(*)')
      .eq('route_id', routeId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getAvailableSeats(scheduleId: string) {
    const { data, error } = await supabase
      .from('shuttle_seats')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('is_available', true);
    
    if (error) throw error;
    return data;
  },

  async bookShuttle(data: any) {
    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('shuttle_bookings')
      .insert(data)
      .select()
      .single();
    
    if (bookingError) throw bookingError;

    // Mark seat as unavailable
    const { error: seatError } = await supabase
      .from('shuttle_seats')
      .update({ is_available: false })
      .eq('schedule_id', data.schedule_id)
      .eq('seat_number', data.seat_number);
    
    if (seatError) throw seatError;

    return booking;
  },

  async cancelBooking(bookingId: string) {
    const { data: booking, error: fetchError } = await supabase
      .from('shuttle_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (fetchError) throw fetchError;

    // Update booking status
    const { error: updateError } = await supabase
      .from('shuttle_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    
    if (updateError) throw updateError;

    // Release seat
    const { error: seatError } = await supabase
      .from('shuttle_seats')
      .update({ is_available: true })
      .eq('schedule_id', booking.schedule_id)
      .eq('seat_number', booking.seat_number);
    
    if (seatError) throw seatError;

    return { success: true };
  },
};

// ============================================================================
// RIDES
// ============================================================================

export const rideService = {
  async getRideTypes() {
    const { data, error } = await supabase
      .from('ride_types')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    return data as Ride[];
  },

  async requestRide(data: any) {
    const { data: ride, error } = await supabase
      .from('rides')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return ride;
  },

  async cancelRide(rideId: string, reason?: string) {
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: 'user',
      })
      .eq('id', rideId);
    
    if (error) throw error;
    return { success: true };
  },

  async getRideStatus(rideId: string) {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async rateRide(rideId: string, rating: number, comment?: string) {
    const { error } = await supabase
      .from('rides')
      .update({
        user_rating: rating,
        user_review_comment: comment,
      })
      .eq('id', rideId);
    
    if (error) throw error;
    return { success: true };
  },
};

// ============================================================================
// BOOKINGS
// ============================================================================

export const bookingService = {
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Booking[];
  },

  async getBookingDetails(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async cancelBooking(bookingId: string, reason?: string) {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', bookingId);
    
    if (error) throw error;
    return { success: true };
  },
};

// ============================================================================
// PROMOS
// ============================================================================

export const promoService = {
  async getActivePromos() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .lt('valid_from', now)
      .gt('valid_until', now);
    
    if (error) throw error;
    return data as Promo[];
  },

  async validatePromo(code: string, userId: string) {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error) throw new Error('Promo code not found');

    // Check usage limit
    const { count, error: countError } = await supabase
      .from('promo_code_usage')
      .select('*', { count: 'exact' })
      .eq('promo_code_id', data.id)
      .eq('user_id', userId);
    
    if (countError) throw countError;

    if (data.usage_limit_per_user && count! >= data.usage_limit_per_user) {
      throw new Error('Promo code usage limit reached');
    }

    return data;
  },

  async usePromo(
    promoId: string,
    userId: string,
    bookingId: string,
    discountAmount: number
  ) {
    const { error } = await supabase
      .from('promo_code_usage')
      .insert({
        promo_code_id: promoId,
        user_id: userId,
        booking_id: bookingId,
        discount_amount: discountAmount,
      });
    
    if (error) throw error;
    return { success: true };
  },
};

// ============================================================================
// FARE RULES
// ============================================================================

export const fareService = {
  async getFareRules(serviceType: 'ride' | 'shuttle') {
    const { data, error } = await supabase
      .from('fare_rules')
      .select('*')
      .eq('service_type', serviceType)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  async getSurgeMultiplier(serviceType: 'ride' | 'shuttle') {
    const now = new Date();
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('surge_pricing_rules')
      .select('*')
      .eq('service_type', serviceType)
      .eq('day_of_week', dayOfWeek)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)
      .eq('is_active', true);
    
    if (error) throw error;

    if (data && data.length > 0) {
      return data[0].multiplier;
    }

    return 1.0; // No surge
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
