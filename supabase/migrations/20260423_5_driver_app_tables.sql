-- ============================================================================
-- Driver App Tables & Logic
-- PYU-GO Platform
-- ============================================================================

-- ============================================================================
-- DRIVERS TABLE (Active State)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Active status
  is_online BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'on_trip', 'offline')),
  
  -- Real-time location
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  
  -- Stats & Performance
  response_rate DECIMAL(5,2) DEFAULT 100.0,
  total_earnings DECIMAL(15,2) DEFAULT 0,
  completed_trips INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_drivers_is_online ON public.drivers(is_online);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);

-- ============================================================================
-- DRIVER LOCATION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(10,2),
  speed DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX idx_driver_locations_recorded_at ON public.driver_locations(recorded_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drivers can read/update their own state
CREATE POLICY "Drivers can manage their own state"
ON public.drivers FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Everyone (or authenticated users) can see online drivers (for passenger app)
CREATE POLICY "Public can see online drivers"
ON public.drivers FOR SELECT
USING (is_online = true);

-- Drivers can insert their own location history
CREATE POLICY "Drivers can insert location history"
ON public.driver_locations FOR INSERT
WITH CHECK (auth.uid() = driver_id);

-- Drivers can see their own location history
CREATE POLICY "Drivers can see their own location history"
ON public.driver_locations FOR SELECT
USING (auth.uid() = driver_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to record location history automatically when current_location updates
CREATE OR REPLACE FUNCTION record_driver_location_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.current_latitude IS DISTINCT FROM NEW.current_latitude OR OLD.current_longitude IS DISTINCT FROM NEW.current_longitude) THEN
        INSERT INTO public.driver_locations (driver_id, latitude, longitude, recorded_at)
        VALUES (NEW.id, NEW.current_latitude, NEW.current_longitude, NOW());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_record_driver_location
AFTER UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION record_driver_location_history();

COMMENT ON TABLE public.drivers IS 'Real-time state and performance of drivers';
COMMENT ON TABLE public.driver_locations IS 'History of driver locations for tracking and analysis';
