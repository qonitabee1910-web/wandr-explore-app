import { supabase, getCurrentUser } from '@/lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'driver' | 'admin';
}

class AuthService {
  /**
   * Sign up new user
   */
  async signup(data: SignUpData) {
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // Create user profile in public.users
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.phone,
            role: 'user',
            status: 'active',
          });

        if (profileError) throw profileError;
      }

      return {
        success: true,
        message: 'Signup successful! Please check your email to verify.',
        user: authData.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * Sign in user
   */
  async login(data: LoginData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user!.id)
        .single();

      if (profileError) throw profileError;

      return {
        success: true,
        user: authData.user,
        profile: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Sign out user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name,
        phone: profile?.phone,
        avatar: profile?.profile_picture_url,
        role: profile?.role || 'user',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<AuthUser>) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          profile_picture_url: data.avatar,
        })
        .eq('id', user.id);

      if (error) throw error;

      return {
        success: true,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  /**
   * Register as driver
   */
  async registerAsDriver(licenseNumber: string, licenseExpiry: string) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Create driver profile
      const { error } = await supabase.from('drivers').insert({
        id: user.id,
        license_number: licenseNumber,
        license_expiry_date: licenseExpiry,
      });

      if (error) throw error;

      // Update user role
      await supabase
        .from('users')
        .update({ role: 'driver' })
        .eq('id', user.id);

      return {
        success: true,
        message: 'Registered as driver successfully. Pending approval.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Upload driver document
   */
  async uploadDriverDocument(
    file: File,
    documentType: 'license' | 'id_card' | 'vehicle_registration' | 'other'
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const fileName = `${user.id}/${documentType}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(data.path);

      // Save document reference
      const { error: dbError } = await supabase
        .from('driver_documents')
        .insert({
          driver_id: user.id,
          document_type: documentType,
          document_url: publicData.publicUrl,
        });

      if (dbError) throw dbError;

      return {
        success: true,
        message: 'Document uploaded successfully',
        url: publicData.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

export const authService = new AuthService();
