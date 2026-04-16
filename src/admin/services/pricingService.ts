/**
 * Pricing Control Service
 * Handle pricing rules, surge multipliers, and fare estimates
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { PricingRule, SurgeMultiplier, FareEstimate, ApiResponse } from '../types';

export const pricingService = {
  /**
   * Get all pricing rules
   */
  async getPricingRules(serviceType?: 'ride' | 'shuttle'): Promise<ApiResponse<PricingRule[]>> {
    try {
      let query = supabase.from('pricing_rules').select('*');

      if (serviceType) {
        query = query.eq('service_type', serviceType);
      }

      const { data, error } = await query.order('priority', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as PricingRule[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a pricing rule
   */
  async createPricingRule(rule: Partial<PricingRule>): Promise<ApiResponse<PricingRule>> {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as PricingRule,
        message: 'Pricing rule created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a pricing rule
   */
  async updatePricingRule(ruleId: string, updates: Partial<PricingRule>): Promise<ApiResponse<PricingRule>> {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as PricingRule,
        message: 'Pricing rule updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Delete a pricing rule
   */
  async deletePricingRule(ruleId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', ruleId);

      if (error) throw error;

      return {
        success: true,
        message: 'Pricing rule deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get surge multipliers
   */
  async getSurgeMultipliers(): Promise<ApiResponse<SurgeMultiplier[]>> {
    try {
      const { data, error } = await supabase
        .from('surge_multipliers')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      return {
        success: true,
        data: data as SurgeMultiplier[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create a surge multiplier
   */
  async createSurgeMultiplier(multiplier: Partial<SurgeMultiplier>): Promise<ApiResponse<SurgeMultiplier>> {
    try {
      const { data, error } = await supabase
        .from('surge_multipliers')
        .insert(multiplier)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as SurgeMultiplier,
        message: 'Surge multiplier created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a surge multiplier
   */
  async updateSurgeMultiplier(
    multiplierId: string,
    updates: Partial<SurgeMultiplier>
  ): Promise<ApiResponse<SurgeMultiplier>> {
    try {
      const { data, error } = await supabase
        .from('surge_multipliers')
        .update(updates)
        .eq('id', multiplierId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as SurgeMultiplier,
        message: 'Surge multiplier updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Calculate fare estimate
   */
  async calculateFareEstimate(
    distance: number,
    duration: number,
    serviceType: 'ride' | 'shuttle'
  ): Promise<ApiResponse<FareEstimate>> {
    try {
      // Get base fare
      const { data: baseRule } = await supabase
        .from('pricing_rules')
        .select('value')
        .eq('service_type', serviceType)
        .eq('rule_type', 'base_fare')
        .single();

      // Get distance rate
      const { data: distanceRule } = await supabase
        .from('pricing_rules')
        .select('value')
        .eq('service_type', serviceType)
        .eq('rule_type', 'distance_rate')
        .single();

      // Get time rate
      const { data: timeRule } = await supabase
        .from('pricing_rules')
        .select('value')
        .eq('service_type', serviceType)
        .eq('rule_type', 'time_rate')
        .single();

      // Get current surge multiplier (simplified - no location check)
      const { data: surgeRule } = await supabase
        .from('surge_multipliers')
        .select('multiplier')
        .eq('active', true)
        .limit(1)
        .single();

      const baseFare = baseRule?.value || 50; // Default values in currency units
      const distanceFare = (distance || 0) * (distanceRule?.value || 10);
      const timeFare = (duration / 60) * (timeRule?.value || 1);
      const surgeMultiplier = surgeRule?.multiplier || 1;

      const estimate: FareEstimate = {
        distance,
        duration,
        base_fare: baseFare,
        distance_fare: parseFloat(distanceFare.toFixed(2)),
        time_fare: parseFloat(timeFare.toFixed(2)),
        surge_multiplier: surgeMultiplier,
        total_fare: parseFloat(
          ((baseFare + distanceFare + timeFare) * surgeMultiplier).toFixed(2)
        ),
        currency: 'IDR',
      };

      return {
        success: true,
        data: estimate,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Real-time subscription to pricing rule changes
   */
  subscribeToPricingRules(callback: (event: any) => void) {
    return supabase
      .channel('pricing_rules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pricing_rules' }, callback)
      .subscribe();
  },
};

export default pricingService;
