/**
 * Ads Control Service
 * Handle advertisement campaigns and metrics
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import { Advertisement, AdCampaign, AdMetrics, PaginatedResponse, ApiResponse } from '../types';

export const adsService = {
  /**
   * Get all advertisements with pagination
   */
  async getAds(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Advertisement>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('advertisements')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as Advertisement[],
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
   * Create a new advertisement
   */
  async createAd(ad: Partial<Advertisement>): Promise<ApiResponse<Advertisement>> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .insert(ad)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Advertisement,
        message: 'Advertisement created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update an advertisement
   */
  async updateAd(adId: string, updates: Partial<Advertisement>): Promise<ApiResponse<Advertisement>> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', adId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Advertisement,
        message: 'Advertisement updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Toggle ad status (active/paused)
   */
  async toggleAdStatus(adId: string, status: 'active' | 'paused'): Promise<ApiResponse<Advertisement>> {
    return this.updateAd(adId, { status });
  },

  /**
   * Delete an advertisement
   */
  async deleteAd(adId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('advertisements').delete().eq('id', adId);

      if (error) throw error;

      return {
        success: true,
        message: 'Advertisement deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get all campaigns with pagination
   */
  async getCampaigns(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<AdCampaign>>> {
    try {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('ad_campaigns')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as AdCampaign[],
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
   * Create a new campaign
   */
  async createCampaign(campaign: Partial<AdCampaign>): Promise<ApiResponse<AdCampaign>> {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as AdCampaign,
        message: 'Campaign created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update a campaign
   */
  async updateCampaign(campaignId: string, updates: Partial<AdCampaign>): Promise<ApiResponse<AdCampaign>> {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as AdCampaign,
        message: 'Campaign updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get ad metrics
   */
  async getAdMetrics(adId: string, days: number = 30): Promise<ApiResponse<AdMetrics[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('ad_metrics')
        .select('*')
        .eq('ad_id', adId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as AdMetrics[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get campaign performance summary
   */
  async getCampaignPerformance(campaignId: string): Promise<
    ApiResponse<{
      campaignName: string;
      totalImpressions: number;
      totalClicks: number;
      totalConversions: number;
      ctr: number;
      conversionRate: number;
      costPerClick: number;
      costPerConversion: number;
      spent: number;
      budget: number;
    }>
  > {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('ad_campaigns')
        .select('name, budget, spent')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get ads for this campaign
      const { data: ads, error: adsError } = await supabase
        .from('advertisements')
        .select('impressions, clicks, conversions')
        .eq('campaign_id', campaignId);

      if (adsError) throw adsError;

      const adsData = ads || [];
      const totalImpressions = adsData.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      const totalClicks = adsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      const totalConversions = adsData.reduce((sum, ad) => sum + (ad.conversions || 0), 0);

      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      const performance = {
        campaignName: campaign.name,
        totalImpressions,
        totalClicks,
        totalConversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        costPerClick: totalClicks > 0 ? parseFloat(((campaign.spent || 0) / totalClicks).toFixed(2)) : 0,
        costPerConversion: totalConversions > 0
          ? parseFloat(((campaign.spent || 0) / totalConversions).toFixed(2))
          : 0,
        spent: campaign.spent || 0,
        budget: campaign.budget || 0,
      };

      return {
        success: true,
        data: performance,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Real-time subscription to ad changes
   */
  subscribeToAds(callback: (event: any) => void) {
    return supabase
      .channel('advertisements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advertisements' }, callback)
      .subscribe();
  },
};

export default adsService;
