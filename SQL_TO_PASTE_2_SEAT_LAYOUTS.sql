-- ============================================================================
-- READY TO COPY: Seat Layout Manager Migration
-- Paste this entire SQL into Supabase Dashboard SQL Editor
-- IMPORTANT: Run SQL_TO_PASTE_1_USERS_TABLE.sql FIRST!
-- ============================================================================

-- ============================================================================
-- Seat Layout Manager Tables
-- PYU-GO Platform
-- ============================================================================

-- Create seat_layouts table
CREATE TABLE IF NOT EXISTS public.seat_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_map_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seat_categories table
CREATE TABLE IF NOT EXISTS public.seat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  base_price_multiplier DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seats table
CREATE TABLE IF NOT EXISTS public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID NOT NULL REFERENCES public.seat_layouts(id) ON DELETE CASCADE,
  seat_number VARCHAR(50) NOT NULL,
  category_id UUID REFERENCES public.seat_categories(id),
  x_pos DECIMAL(5,2) NOT NULL, -- Percentage 0-100
  y_pos DECIMAL(5,2) NOT NULL, -- Percentage 0-100
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'blocked')),
  price_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create layout_history table
CREATE TABLE IF NOT EXISTS public.layout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID NOT NULL REFERENCES public.seat_layouts(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.users(id),
  change_description TEXT,
  snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Published layouts are viewable by anyone
CREATE POLICY "Public can view published seat layouts" 
ON public.seat_layouts FOR SELECT 
USING (status = 'published');

-- Admins can manage everything
CREATE POLICY "Admins can manage seat layouts" 
ON public.seat_layouts FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage seat categories" 
ON public.seat_categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage seats" 
ON public.seats FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage layout history" 
ON public.layout_history FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Public can view seats for published layouts
CREATE POLICY "Public can view seats for published layouts" 
ON public.seats FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.seat_layouts 
    WHERE id = public.seats.layout_id AND status = 'published'
  )
);

-- Public can view categories
CREATE POLICY "Public can view seat categories" 
ON public.seat_categories FOR SELECT 
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_seat_layouts_updated_at
BEFORE UPDATE ON public.seat_layouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seats_updated_at
BEFORE UPDATE ON public.seats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.seat_layouts IS 'Master data for seat layouts with visual map';
COMMENT ON TABLE public.seat_categories IS 'Categories for seats like VIP, Regular, etc.';
COMMENT ON TABLE public.seats IS 'Individual seats within a layout with coordinates';
COMMENT ON TABLE public.layout_history IS 'History of changes to seat layouts';

-- ============================================================================
-- If this runs successfully, continue with other migration SQL files
-- ============================================================================
