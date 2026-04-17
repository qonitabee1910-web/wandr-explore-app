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
      // Use localhost for redirect URL - Supabase requires whitelisted domains
      const redirectUrl = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `http://localhost:${window.location.port || 8080}/auth/callback`
            : `${window.location.origin}/auth/callback`)
        : 'http://localhost:8080/auth/callback';
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Signup failed: No user returned');
      }

      // Attempt to create user profile in public.users
      // This might fail if RLS policy is too restrictive, which is okay
      // The profile will be created on first login if it doesn't exist
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email.toLowerCase(),
            full_name: data.fullName,
            phone_number: data.phone,
            role: 'user',
            status: 'active',
          });

        if (profileError) {
          // 23505 = unique violation (profile already exists) - this is fine
          // Other errors should be logged but not throw
          if (profileError.code !== '23505') {
            console.warn('Warning: Could not create profile during signup:', profileError);
          }
        }
      } catch (profileCreateError) {
        // Log but don't block signup
        console.warn('Profile creation during signup failed (this is okay):', profileCreateError);
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
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (error) throw error;

      if (!authData.user) {
        throw new Error('Login failed: No user returned');
      }

      // Get user profile
      let userProfile = null;
      const { data: existingProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist (404), create it
        if (profileError.code === 'PGRST116') {
          try {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: (authData.user.email || data.email).toLowerCase(),
                full_name: authData.user.user_metadata?.full_name || '',
                phone_number: authData.user.user_metadata?.phone,
                role: 'user',
                status: 'active',
              });

            if (createError) {
              // 23505 = duplicate key (already exists, race condition)
              if (createError.code !== '23505') {
                console.warn('Warning: Could not create profile during login:', createError);
              }
              // Don't block login, just proceed without profile
            }
          } catch (createErr) {
            console.warn('Profile creation during login failed:', createErr);
          }
        } else {
          // 406 or other errors - don't block login
          console.warn('Profile fetch error (non-blocking):', profileError);
        }
      } else {
        userProfile = existingProfile;
      }

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
        phone: profile?.phone_number,
        avatar: profile?.profile_photo_url,
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
          phone_number: data.phone,
          profile_photo_url: data.avatar,
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // Update user profile with driver info
      const { error } = await supabase
        .from('users')
        .update({
          role: 'driver',
          driver_license_number: licenseNumber,
          driver_license_expiry: licenseExpiry,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Create entry in drivers table for real-time state
      const { error: driverError } = await supabase
        .from('drivers')
        .upsert({
          id: user.id,
          is_online: false,
          status: 'offline',
        });

      if (driverError) {
        console.warn('Driver state creation failed (non-blocking):', driverError);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Driver registration failed',
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
