-- ============================================================================
-- PYU-GO DATABASE SCHEMA
-- Comprehensive schema for Ride-sharing, Shuttle, and Hotel booking platform
-- ============================================================================

-- ============================================================================
-- 1. AUTH & USER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  profile_picture_url TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin', 'moderator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMP,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_language TEXT DEFAULT 'id',
  push_notification_enabled BOOLEAN DEFAULT TRUE,
  email_notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  last_login_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- ============================================================================
-- 2. DRIVER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry_date DATE NOT NULL,
  vehicle_id UUID,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'suspended', 'rejected', 'inactive')),
  approval_status_updated_at TIMESTAMP,
  approval_note TEXT,
  total_rides_completed INT DEFAULT 0,
  total_shuttle_trips INT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_code TEXT,
  documents_verified BOOLEAN DEFAULT FALSE,
  documents_verified_at TIMESTAMP,
  background_check_passed BOOLEAN DEFAULT FALSE,
  background_check_passed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_license_number ON public.drivers(license_number);

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'id_card', 'vehicle_registration', 'vehicle_insurance', 'background_check', 'other')),
  document_url TEXT NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON public.driver_documents(status);

CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ride_id UUID,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_user_id ON public.driver_ratings(user_id);

-- ============================================================================
-- 3. VEHICLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'bicycle', 'shuttle')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT,
  license_plate TEXT UNIQUE NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  registration_expiry_date DATE NOT NULL,
  manufacture_year INT,
  capacity INT NOT NULL,
  mileage INT DEFAULT 0,
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX idx_vehicles_license_plate ON public.vehicles(license_plate);

-- ============================================================================
-- 4. HOTELS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  stars INT CHECK (stars >= 1 AND stars <= 5),
  total_reviews INT DEFAULT 0,
  price_from DECIMAL(15, 2),
  image_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_hotels_city ON public.hotels(city);
CREATE INDEX idx_hotels_rating ON public.hotels(rating);

CREATE TABLE IF NOT EXISTS public.hotel_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL
);

CREATE INDEX idx_hotel_facilities_hotel_id ON public.hotel_facilities(hotel_id);

CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  total_rooms INT DEFAULT 1,
  available_rooms INT DEFAULT 1,
  amenities TEXT[],
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_hotel_rooms_hotel_id ON public.hotel_rooms(hotel_id);

-- ============================================================================
-- 5. SHUTTLES & ROUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttle_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shuttle_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES public.shuttle_operators(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km INT,
  estimated_duration_minutes INT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_shuttle_routes_operator ON public.shuttle_routes(operator_id);
CREATE INDEX idx_shuttle_routes_route ON public.shuttle_routes(origin_city, destination_city);

CREATE TABLE IF NOT EXISTS public.shuttle_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.shuttle_routes(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  capacity INT NOT NULL,
  available_seats INT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  service_class TEXT NOT NULL CHECK (service_class IN ('regular', 'semi_executive', 'executive')),
  meal_included BOOLEAN DEFAULT FALSE,
  baggage_allowance_kg INT,
  cabin_baggage_allowance_kg INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'full')),
  days_of_week TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_shuttle_schedules_route ON public.shuttle_schedules(route_id);
CREATE INDEX idx_shuttle_schedules_vehicle ON public.shuttle_schedules(vehicle_id);

CREATE TABLE IF NOT EXISTS public.shuttle_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.shuttle_schedules(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  row_letter CHAR(1),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(schedule_id, seat_number)
);

CREATE INDEX idx_shuttle_seats_schedule ON public.shuttle_seats(schedule_id);

-- ============================================================================
-- 6. RIDES & RIDE-HAILING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  capacity INT NOT NULL,
  icon_url TEXT,
  base_price DECIMAL(15, 2) NOT NULL,
  price_per_km DECIMAL(10, 2) NOT NULL,
  price_per_minute DECIMAL(10, 2) DEFAULT 1000,
  minimum_fare DECIMAL(15, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  ride_type_id UUID NOT NULL REFERENCES public.ride_types(id),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  
  pickup_location TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  destination_location TEXT NOT NULL,
  destination_latitude DECIMAL(10, 8),
  destination_longitude DECIMAL(11, 8),
  
  estimated_distance_km DECIMAL(10, 2),
  estimated_duration_minutes INT,
  actual_distance_km DECIMAL(10, 2),
  actual_duration_minutes INT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  cancelled_by TEXT,
  
  base_fare DECIMAL(15, 2),
  distance_fare DECIMAL(15, 2),
  time_fare DECIMAL(15, 2),
  surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  promo_code_used TEXT,
  total_fare DECIMAL(15, 2),
  
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'wallet', 'bank_transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  payment_completed_at TIMESTAMP,
  
  driver_rating INT CHECK (driver_rating IS NULL OR (driver_rating >= 1 AND driver_rating <= 5)),
  driver_review_comment TEXT,
  user_rating INT CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
  user_review_comment TEXT,
  
  requested_at TIMESTAMP DEFAULT now() NOT NULL,
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_rides_user_id ON public.rides(user_id);
CREATE INDEX idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_requested_at ON public.rides(requested_at);
CREATE INDEX idx_rides_ride_type ON public.rides(ride_type_id);

-- ============================================================================
-- 7. BOOKINGS (GENERIC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('hotel', 'shuttle', 'ride')),
  
  -- Reference to specific booking type
  hotel_booking_id UUID,
  shuttle_booking_id UUID,
  ride_id UUID,
  
  booking_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  
  total_price DECIMAL(15, 2) NOT NULL,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  promo_code_used TEXT,
  final_price DECIMAL(15, 2) NOT NULL,
  
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending',
  
  special_requests TEXT,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Hotel Bookings
CREATE TABLE IF NOT EXISTS public.hotel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES public.hotel_rooms(id),
  
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_nights INT NOT NULL,
  number_of_rooms INT DEFAULT 1,
  number_of_guests INT NOT NULL,
  
  room_rate_per_night DECIMAL(15, 2) NOT NULL,
  total_room_price DECIMAL(15, 2) NOT NULL,
  taxes_and_fees DECIMAL(15, 2) DEFAULT 0,
  total_price DECIMAL(15, 2) NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  special_requests TEXT,
  
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

CREATE INDEX idx_hotel_bookings_user_id ON public.hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_hotel_id ON public.hotel_bookings(hotel_id);

-- Shuttle Bookings
CREATE TABLE IF NOT EXISTS public.shuttle_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.shuttle_schedules(id) ON DELETE RESTRICT,
  departure_date DATE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled')),
  
  passenger_name TEXT NOT NULL,
  passenger_email TEXT,
  passenger_phone TEXT,
  seat_number INT NOT NULL,
  
  base_price DECIMAL(15, 2) NOT NULL,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_price DECIMAL(15, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  
  boarding_code TEXT UNIQUE NOT NULL,
  checked_in_at TIMESTAMP,
  
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  UNIQUE(schedule_id, departure_date, seat_number)
);

CREATE INDEX idx_shuttle_bookings_user_id ON public.shuttle_bookings(user_id);
CREATE INDEX idx_shuttle_bookings_schedule ON public.shuttle_bookings(schedule_id);
CREATE INDEX idx_shuttle_bookings_boarding_code ON public.shuttle_bookings(boarding_code);

-- ============================================================================
-- 8. PRICING & FARE RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fare_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL CHECK (service_type IN ('ride', 'shuttle')),
  name TEXT NOT NULL,
  description TEXT,
  
  base_fare DECIMAL(15, 2) NOT NULL,
  price_per_km DECIMAL(10, 2),
  price_per_minute DECIMAL(10, 2),
  minimum_fare DECIMAL(15, 2),
  
  valid_from TIMESTAMP DEFAULT now(),
  valid_until TIMESTAMP,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_fare_rules_service ON public.fare_rules(service_type);
CREATE INDEX idx_fare_rules_active ON public.fare_rules(is_active);

CREATE TABLE IF NOT EXISTS public.surge_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL CHECK (service_type IN ('ride', 'shuttle')),
  
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
  
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_surge_pricing_service ON public.surge_pricing_rules(service_type);

CREATE TABLE IF NOT EXISTS public.weather_surge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weather_condition TEXT NOT NULL,
  multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- ============================================================================
-- 9. PROMO CODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  maximum_discount DECIMAL(15, 2),
  minimum_purchase DECIMAL(15, 2) DEFAULT 0,
  
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('all', 'ride', 'shuttle', 'hotel')),
  
  usage_limit_total INT,
  usage_limit_per_user INT DEFAULT 1,
  current_usage_count INT DEFAULT 0,
  
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_valid_from ON public.promo_codes(valid_from, valid_until);

CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  discount_amount DECIMAL(15, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT now() NOT NULL,
  UNIQUE(promo_code_id, user_id, booking_id)
);

CREATE INDEX idx_promo_code_usage_user ON public.promo_code_usage(user_id);
CREATE INDEX idx_promo_code_usage_code ON public.promo_code_usage(promo_code_id);

-- ============================================================================
-- 10. PAYMENTS & TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'wallet_topup', 'driver_withdrawal')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'wallet', 'e_wallet')),
  payment_provider TEXT,
  transaction_reference TEXT UNIQUE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  status_reason TEXT,
  
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON public.transactions(booking_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- ============================================================================
-- 11. ADMIN & SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  admin_role TEXT NOT NULL CHECK (admin_role IN ('super_admin', 'admin', 'moderator', 'analyst')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_admin_users_role ON public.admin_users(admin_role);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  changes JSONB,
  reason TEXT,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('booking', 'payment', 'driver', 'account', 'technical', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  
  assigned_to UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);

-- ============================================================================
-- 12. ANALYTICS & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  
  session_id TEXT,
  app_version TEXT,
  os TEXT,
  device_type TEXT,
  
  ip_address INET,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- ============================================================================
-- 13. AUTO-UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shuttle_routes_updated_at BEFORE UPDATE ON public.shuttle_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shuttle_schedules_updated_at BEFORE UPDATE ON public.shuttle_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER promo_codes_updated_at BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER admin_audit_logs_updated_at BEFORE UPDATE ON public.admin_audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 14. INITIAL DEMO DATA
-- ============================================================================

-- Insert initial ride types
INSERT INTO public.ride_types (name, description, capacity, base_price, price_per_km) VALUES
('Ride Car', 'Kenyamanan 4 penumpang', 4, 15000, 5000),
('Ride Bike', 'Perjalanan cepat 1 penumpang', 1, 5000, 2500),
('Ride Luxury', 'Kemewahan 4 penumpang premium', 4, 30000, 10000)
ON CONFLICT DO NOTHING;

-- Insert initial shuttle operators
INSERT INTO public.shuttle_operators (name, code, description) VALUES
('Express Trans', 'EXP', 'Perusahaan shuttle profesional'),
('Super Shuttle', 'SUPER', 'Shuttle premium dengan harga kompetitif'),
('City Travel', 'CITY', 'Operator lokal yang terpercaya')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT admin_role FROM public.admin_users WHERE id = auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Drivers can view/edit their own profile
CREATE POLICY "Drivers can view own profile" ON public.drivers
  FOR SELECT USING (auth.uid() = id);

-- Users can view rides they booked
CREATE POLICY "Users can view own rides" ON public.rides
  FOR SELECT USING (auth.uid() = user_id);

-- Drivers can view rides assigned to them
CREATE POLICY "Drivers can view own rides" ON public.rides
  FOR SELECT USING (auth.uid() = driver_id);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create support tickets
CREATE POLICY "Users can create support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own support tickets
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can view all audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING ((SELECT admin_role FROM public.admin_users WHERE id = auth.uid()) IS NOT NULL);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Schema created successfully!
-- Next steps:
-- 1. Configure Supabase Auth with email/password
-- 2. Set up authentication policies for email verification
-- 3. Create Edge Functions for complex business logic
-- 4. Configure Realtime subscriptions for live updates
