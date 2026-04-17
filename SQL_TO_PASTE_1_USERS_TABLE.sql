-- ============================================================================
-- READY TO COPY: Users Table Migration
-- Paste this entire SQL into Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- Auto-update updated_at column - GENERIC FUNCTION FOR ALL TABLES
-- ============================================================================

-- Generic function to update updated_at timestamp for any table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Legacy function name (for backward compatibility)
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Users Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_photo_url VARCHAR(500),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Account information
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin', 'super_admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  
  -- Verification status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,
  
  -- Driver specific
  driver_license_number VARCHAR(100),
  driver_license_expiry DATE,
  vehicle_type VARCHAR(50),
  vehicle_plate_number VARCHAR(50),
  vehicle_year INTEGER,
  vehicle_color VARCHAR(50),
  bank_account VARCHAR(100),
  bank_name VARCHAR(100),
  
  -- Ratings and stats
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_distance DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  preferences JSONB,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  referral_code VARCHAR(50) UNIQUE,
  referred_by UUID REFERENCES public.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON public.users;
CREATE TRIGGER update_users_updated_at_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- If this runs successfully, next run the SQL from:
-- supabase/migrations/20260417112648_seat_layout_manager.sql
-- ============================================================================
