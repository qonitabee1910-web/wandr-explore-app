-- ============================================================================
-- Create Users Table
-- PYU-GO Platform
-- ============================================================================

-- Create users table with comprehensive profile information
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
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin', 'super_admin', 'moderator', 'analyst')),
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
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_phone ON public.users(phone_number);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);

-- Create RLS policies for users table
CREATE POLICY "Users can read their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own profile during signup"
ON public.users FOR INSERT
WITH CHECK (
  auth.uid() = id AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.users IS 'User profiles for PYU-GO platform';
