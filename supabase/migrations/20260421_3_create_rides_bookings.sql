-- ============================================================================
-- Create Rides & Bookings Tables
-- PYU-GO Platform
-- ============================================================================

-- ============================================================================
-- RIDES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Passenger & Driver
  passenger_id UUID NOT NULL REFERENCES public.users(id),
  driver_id UUID REFERENCES public.users(id),
  
  -- Route information
  pickup_latitude DECIMAL(10,8),
  pickup_longitude DECIMAL(11,8),
  pickup_address TEXT,
  dropoff_latitude DECIMAL(10,8),
  dropoff_longitude DECIMAL(11,8),
  dropoff_address TEXT,
  
  -- Ride details
  ride_type VARCHAR(50) NOT NULL CHECK (ride_type IN ('ride', 'shuttle', 'premium')),
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN (
    'requested', 'accepted', 'started', 'completed', 'cancelled'
  )),
  
  -- Distance and time
  distance_km DECIMAL(10,2),
  duration_minutes INTEGER,
  
  -- Pricing
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  time_fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_fare DECIMAL(10,2),
  payment_method VARCHAR(50),
  
  -- Additional info
  passenger_rating DECIMAL(3,2),
  driver_rating DECIMAL(3,2),
  passenger_notes TEXT,
  driver_notes TEXT,
  cancellation_reason VARCHAR(255),
  cancelled_by VARCHAR(20),
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_ride_type ON public.rides(ride_type);
CREATE INDEX idx_rides_created_at ON public.rides(created_at);

-- ============================================================================
-- RIDE LOCATIONS TABLE (for tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ride_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ride_locations_ride_id ON public.ride_locations(ride_id);
CREATE INDEX idx_ride_locations_recorded_at ON public.ride_locations(recorded_at);

-- ============================================================================
-- DRIVER DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url VARCHAR(500),
  document_number VARCHAR(100),
  expiry_date DATE,
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON public.driver_documents(verification_status);

-- ============================================================================
-- DRIVER RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id),
  passenger_id UUID NOT NULL REFERENCES public.users(id),
  rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_ride_id ON public.driver_ratings(ride_id);

-- ============================================================================
-- PASSENGERS RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.passenger_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id),
  driver_id UUID NOT NULL REFERENCES public.users(id),
  rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.passenger_ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_passenger_ratings_passenger_id ON public.passenger_ratings(passenger_id);
CREATE INDEX idx_passenger_ratings_ride_id ON public.passenger_ratings(ride_id);

-- ============================================================================
-- RIDE PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ride_payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ride_payments_ride_id ON public.ride_payments(ride_id);
CREATE INDEX idx_ride_payments_user_id ON public.ride_payments(user_id);
CREATE INDEX idx_ride_payments_status ON public.ride_payments(status);

-- ============================================================================
-- SHUTTLE STOPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttle_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shuttle_stops ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shuttle_stops_active ON public.shuttle_stops(is_active);
CREATE INDEX idx_shuttle_stops_location ON public.shuttle_stops(latitude, longitude);

-- ============================================================================
-- SHUTTLE ROUTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttle_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_stop_id UUID NOT NULL REFERENCES public.shuttle_stops(id),
  end_stop_id UUID NOT NULL REFERENCES public.shuttle_stops(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shuttle_routes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shuttle_routes_active ON public.shuttle_routes(is_active);

-- ============================================================================
-- SHUTTLE SCHEDULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttle_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.shuttle_routes(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  capacity INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shuttle_schedules ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shuttle_schedules_route_id ON public.shuttle_schedules(route_id);
CREATE INDEX idx_shuttle_schedules_day ON public.shuttle_schedules(day_of_week);

-- ============================================================================
-- SHUTTLE BOOKINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttle_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.shuttle_schedules(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  booking_date DATE NOT NULL,
  number_of_seats INTEGER DEFAULT 1,
  total_fare DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'confirmed',
  booking_reference VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shuttle_bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shuttle_bookings_user_id ON public.shuttle_bookings(user_id);
CREATE INDEX idx_shuttle_bookings_schedule_id ON public.shuttle_bookings(schedule_id);
CREATE INDEX idx_shuttle_bookings_booking_date ON public.shuttle_bookings(booking_date);

COMMENT ON TABLE public.rides IS 'Ride bookings and history';
COMMENT ON TABLE public.ride_locations IS 'Real-time ride location tracking';
COMMENT ON TABLE public.driver_documents IS 'Driver verification documents';
COMMENT ON TABLE public.shuttle_routes IS 'Shuttle transportation routes';
