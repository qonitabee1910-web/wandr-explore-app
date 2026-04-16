/**
 * Promo Control Service
 * Handle promotional codes and campaigns
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { Promo, PromoUsage, PaginatedResponse, ApiResponse } from '../types';

export const promoService = {
  /**
   * Get all promos with pagination
   */
  async getPromos(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Promo>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('promos')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as Promo[],
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
   * Get active promos
   */
  async getActivePromos(): Promise<ApiResponse<Promo[]>> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('status', 'active')
        .lte('valid_from', now)
        .gte('valid_to', now);

      if (error) throw error;

      return {
        success: true,
        data: data as Promo[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a new promo
   */
  async createPromo(promo: Partial<Promo>): Promise<ApiResponse<Promo>> {
    try {
      const { data, error } = await supabase
        .from('promos')
        .insert(promo)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Promo,
        message: 'Promo created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a promo
   */
  async updatePromo(promoId: string, updates: Partial<Promo>): Promise<ApiResponse<Promo>> {
    try {
      const { data, error } = await supabase
        .from('promos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', promoId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Promo,
        message: 'Promo updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Deactivate a promo
   */
  async deactivatePromo(promoId: string): Promise<ApiResponse<Promo>> {
    return this.updatePromo(promoId, { status: 'inactive' });
  },

  /**
   * Delete a promo
   */
  async deletePromo(promoId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('promos').delete().eq('id', promoId);

      if (error) throw error;

      return {
        success: true,
        message: 'Promo deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get promo usage history
   */
  async getPromoUsage(promoId: string, page: number = 1, limit: number = 50): Promise<
    ApiResponse<PaginatedResponse<PromoUsage>>
  > {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('promo_usage')
        .select('*', { count: 'exact' })
        .eq('promo_id', promoId)
        .order('used_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as PromoUsage[],
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
   * Get promo statistics
   */
  async getPromoStats(promoId: string): Promise<
    ApiResponse<{
      totalUsed: number;
      totalDiscount: number;
      averageDiscount: number;
      remainingLimit: number;
    }>
  > {
    try {
      // Get promo details
      const { data: promo, error: promoError } = await supabase
        .from('promos')
        .select('usage_limit, used_count')
        .eq('id', promoId)
        .single();

      if (promoError) throw promoError;

      // Get usage data
      const { data: usage, error: usageError } = await supabase
        .from('promo_usage')
        .select('discount_amount')
        .eq('promo_id', promoId);

      if (usageError) throw usageError;

      const usageData = usage || [];
      const totalDiscount = usageData.reduce((sum, u) => sum + (u.discount_amount || 0), 0);

      const stats = {
        totalUsed: promo.used_count || 0,
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        averageDiscount: usageData.length > 0
          ? parseFloat((totalDiscount / usageData.length).toFixed(2))
          : 0,
        remainingLimit: (promo.usage_limit || 0) - (promo.used_count || 0),
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
   * Real-time subscription to promo changes
   */
  subscribeToPromos(callback: (event: any) => void) {
    return supabase
      .channel('promos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, callback)
      .subscribe();
  },
};

export default promoService;
