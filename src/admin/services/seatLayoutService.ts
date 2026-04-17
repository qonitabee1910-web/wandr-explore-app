import { supabase } from '@/lib/supabase';
import { SeatLayout, Seat, SeatCategory, ApiResponse, LayoutHistory } from '../types';

/**
 * Seat Layout Service - Admin module
 * Handles all operations for visual seat layout management
 */
export const seatLayoutService = {
  // --- Layouts ---
  async getLayouts() {
    return await supabase
      .from('seat_layouts')
      .select('*, seats(*)')
      .order('updated_at', { ascending: false });
  },

  async getLayoutById(id: string) {
    return await supabase
      .from('seat_layouts')
      .select('*, seats(*, category:seat_categories(*))')
      .eq('id', id)
      .single();
  },

  async createLayout(layout: Partial<SeatLayout>) {
    return await supabase
      .from('seat_layouts')
      .insert([layout])
      .select()
      .single();
  },

  async updateLayout(id: string, updates: Partial<SeatLayout>) {
    return await supabase
      .from('seat_layouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteLayout(id: string) {
    return await supabase
      .from('seat_layouts')
      .delete()
      .eq('id', id);
  },

  // --- Seats ---
  async saveSeats(layoutId: string, seats: Partial<Seat>[]) {
    if (seats.length === 0) {
      // If no seats, delete all
      return await supabase
        .from('seats')
        .delete()
        .eq('layout_id', layoutId);
    }

    // 1. Prepare seats for upsert
    const cleanedSeats = seats.map(s => {
      const { 
        category, 
        created_at, 
        updated_at, 
        ...seatData 
      } = s as any;

      // Ensure UUID fields are not empty strings
      if (seatData.category_id === '') delete seatData.category_id;
      
      return { 
        ...seatData, 
        layout_id: layoutId 
      };
    });

    console.log('[SeatLayoutService] Upserting seats:', cleanedSeats.length);

    // 2. Perform upsert (Insert new, update existing based on ID)
    const { data: upsertData, error: upsertError } = await supabase
      .from('seats')
      .upsert(cleanedSeats, { onConflict: 'id' })
      .select();
    
    if (upsertError) {
      console.error('[SeatLayoutService] Upsert Error:', upsertError);
      return { error: upsertError };
    }

    // 3. Delete seats that are no longer in the layout
    const currentSeatIds = cleanedSeats.filter(s => s.id).map(s => s.id);
    if (currentSeatIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('seats')
        .delete()
        .eq('layout_id', layoutId)
        .not('id', 'in', `(${currentSeatIds.join(',')})`);
      
      if (deleteError) {
        console.warn('[SeatLayoutService] Error deleting removed seats:', deleteError);
      }
    }

    return { data: upsertData };
  },

  // --- Categories ---
  async getCategories() {
    return await supabase
      .from('seat_categories')
      .select('*')
      .order('name');
  },

  async createCategory(category: Partial<SeatCategory>) {
    return await supabase
      .from('seat_categories')
      .insert([category])
      .select()
      .single();
  },

  // --- History ---
  async logHistory(history: Partial<LayoutHistory>) {
    return await supabase
      .from('layout_history')
      .insert([history]);
  },

  async getHistory(layoutId: string) {
    return await supabase
      .from('layout_history')
      .select('*')
      .eq('layout_id', layoutId)
      .order('created_at', { ascending: false });
  }
};
