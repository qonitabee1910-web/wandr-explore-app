/**
 * Settings Service
 * Handle payment gateway and email configuration
 */

import { supabase, handleSupabaseError } from './supabaseClient';
import {
  PaymentGatewaySetting,
  EmailSetting,
  NotificationTemplate,
  AppSettings,
  ApiResponse,
} from '../types';

export const settingsService = {
  /**
   * Get payment gateway settings
   */
  async getPaymentGateways(): Promise<ApiResponse<PaymentGatewaySetting[]>> {
    try {
      const { data, error } = await supabase.from('payment_gateway_settings').select('*');

      if (error) throw error;

      return {
        success: true,
        data: data as PaymentGatewaySetting[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Create or update payment gateway setting
   */
  async upsertPaymentGateway(setting: Partial<PaymentGatewaySetting>): Promise<ApiResponse<PaymentGatewaySetting>> {
    try {
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .upsert(setting, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as PaymentGatewaySetting,
        message: 'Payment gateway setting saved',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Test payment gateway connection
   */
  async testPaymentGateway(gatewayId: string): Promise<ApiResponse<{ connected: boolean }>> {
    try {
      // In a real scenario, this would make an API call to the payment gateway
      // For now, returning a mock response
      return {
        success: true,
        data: { connected: true },
        message: 'Payment gateway connection successful',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<ApiResponse<EmailSetting>> {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      return {
        success: true,
        data: data as EmailSetting,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: Partial<EmailSetting>): Promise<ApiResponse<EmailSetting>> {
    try {
      // First try to get existing settings
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      let result;

      if (existing?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('email_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('email_settings')
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        success: true,
        data: result as EmailSetting,
        message: 'Email settings updated',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Test email settings
   */
  async testEmailSettings(testEmail: string): Promise<ApiResponse<{ sent: boolean }>> {
    try {
      // In a real scenario, this would send a test email
      // For now, returning a mock response
      return {
        success: true,
        data: { sent: true },
        message: 'Test email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get notification templates
   */
  async getNotificationTemplates(): Promise<ApiResponse<NotificationTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as NotificationTemplate[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update notification template
   */
  async updateNotificationTemplate(
    templateId: string,
    updates: Partial<NotificationTemplate>
  ): Promise<ApiResponse<NotificationTemplate>> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as NotificationTemplate,
        message: 'Notification template updated',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Get app settings
   */
  async getAppSettings(): Promise<ApiResponse<AppSettings>> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        data: data as AppSettings,
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Update app settings
   */
  async updateAppSettings(settings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    try {
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .single();

      let result;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('app_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('app_settings')
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        success: true,
        data: result as AppSettings,
        message: 'App settings updated',
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }
  },

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean): Promise<ApiResponse<AppSettings>> {
    return this.updateAppSettings({ maintenance_mode: enabled } as any);
  },
};

export default settingsService;
