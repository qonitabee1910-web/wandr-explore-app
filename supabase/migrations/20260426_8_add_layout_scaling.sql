-- ============================================================================
-- Add Scaling and Base Dimensions to Seat Layouts
-- ============================================================================

ALTER TABLE public.seat_layouts 
ADD COLUMN IF NOT EXISTS base_width DECIMAL(10,2) DEFAULT 800.00,
ADD COLUMN IF NOT EXISTS base_height DECIMAL(10,2) DEFAULT 600.00,
ADD COLUMN IF NOT EXISTS global_scale DECIMAL(5,2) DEFAULT 1.00;

-- Add comment to explain columns
COMMENT ON COLUMN public.seat_layouts.base_width IS 'Reference width in pixels used during design';
COMMENT ON COLUMN public.seat_layouts.base_height IS 'Reference height in pixels used during design';
COMMENT ON COLUMN public.seat_layouts.global_scale IS 'Multiplier for all elements in this layout';
