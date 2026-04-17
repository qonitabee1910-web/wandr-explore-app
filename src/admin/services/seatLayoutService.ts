import { supabase } from '@/lib/supabase';
import { SeatLayout, Seat, SeatCategory, ApiResponse, LayoutHistory } from '../types';

// Get Supabase URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

  // Optimized: Get only layout metadata without seats (for quick saves)
  async getLayoutMeta(id: string) {
    return await supabase
      .from('seat_layouts')
      .select('id, name, base_width, base_height, global_scale, status, base_map_url, created_at, updated_at')
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
    const startTime = performance.now();

    if (seats.length === 0) {
      // If no seats, delete all
      return await supabase
        .from('seats')
        .delete()
        .eq('layout_id', layoutId);
    }

    // 1. Prepare seats for upsert (minimal data)
    const cleanedSeats = seats.map(s => {
      const { 
        category,  // Remove category relation
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
      .select('id, layout_id, x_pos, y_pos, seat_number, category_id, status');
    
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

  // --- Image Upload ---
  /**
   * Upload seat layout base map image to Supabase Storage
   * @param file - Image file to upload
   * @param layoutId - Layout ID (used for naming the file)
   * @returns Public URL of the uploaded image or error
   */
  async uploadBaseMapImage(file: File, layoutId: string) {
    console.log('[SeatLayoutService] uploadBaseMapImage called:', { 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type,
      layoutId,
      supabaseUrl: SUPABASE_URL
    });

    try {
      if (!file.type.startsWith('image/')) {
        const error = { message: 'File must be an image' };
        console.error('[SeatLayoutService] File type validation failed:', error);
        return { error };
      }

      if (file.size > 5 * 1024 * 1024) {
        const error = { message: 'File size must be less than 5MB' };
        console.error('[SeatLayoutService] File size validation failed:', error);
        return { error };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `layout-${layoutId}-${timestamp}.${ext}`;
      console.log('[SeatLayoutService] Generated filename:', filename);

      // Upload to Supabase Storage
      console.log('[SeatLayoutService] Starting storage upload...');
      const { data, error } = await supabase.storage
        .from('seat-layouts')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[SeatLayoutService] Storage upload failed:', error);
        return { error };
      }

      console.log('[SeatLayoutService] Storage upload successful:', data);

      // Get public URL - manually construct to ensure correct format
      // Supabase public URL format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{filepath}
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/seat-layouts/${filename}`;

      // Log with separate lines for clarity
      console.log(`✅ [SeatLayoutService] Image uploaded successfully`);
      console.log(`   Filename: ${filename}`);
      console.log(`   Public URL: ${publicUrl}`);
      console.log(`   File size: ${file.size} bytes`);
      console.log(`   Supabase URL: ${SUPABASE_URL}`);

      return { data: publicUrl };
    } catch (err: any) {
      console.error('[SeatLayoutService] Upload Exception:', err);
      return { 
        error: { 
          message: err.message || 'Upload failed' 
        } 
      };
    }
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
