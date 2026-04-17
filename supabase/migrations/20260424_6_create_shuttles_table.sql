-- ============================================================================
-- Create Shuttles Table
-- PYU-GO Platform
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shuttles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 20,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  current_route_id UUID REFERENCES public.shuttle_routes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.shuttles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shuttles_status ON public.shuttles(status);
CREATE INDEX IF NOT EXISTS idx_shuttles_route ON public.shuttles(current_route_id);

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active shuttles') THEN
        CREATE POLICY "Public can view active shuttles"
        ON public.shuttles FOR SELECT
        USING (status = 'active' OR auth.role() = 'authenticated');
    END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_shuttles_updated_at ON public.shuttles;
CREATE TRIGGER update_shuttles_updated_at
BEFORE UPDATE ON public.shuttles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.shuttles IS 'Shuttle vehicle management';
