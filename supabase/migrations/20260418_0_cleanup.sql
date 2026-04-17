-- ============================================================================
-- CLEANUP: Drop all existing objects
-- This migration cleans up the database to allow fresh creation
-- ============================================================================

-- Drop all tables with CASCADE to remove dependencies
DROP TABLE IF EXISTS public.shuttle_bookings CASCADE;
DROP TABLE IF EXISTS public.shuttle_schedules CASCADE;
DROP TABLE IF EXISTS public.shuttle_routes CASCADE;
DROP TABLE IF EXISTS public.shuttle_stops CASCADE;
DROP TABLE IF EXISTS public.ride_payments CASCADE;
DROP TABLE IF EXISTS public.passenger_ratings CASCADE;
DROP TABLE IF EXISTS public.driver_ratings CASCADE;
DROP TABLE IF EXISTS public.ride_locations CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.driver_documents CASCADE;
DROP TABLE IF EXISTS public.promo_usage CASCADE;
DROP TABLE IF EXISTS public.promos CASCADE;
DROP TABLE IF EXISTS public.ad_metrics CASCADE;
DROP TABLE IF EXISTS public.ad_campaigns CASCADE;
DROP TABLE IF EXISTS public.advertisements CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.surge_multipliers CASCADE;
DROP TABLE IF EXISTS public.pricing_rules CASCADE;
DROP TABLE IF EXISTS public.email_settings CASCADE;
DROP TABLE IF EXISTS public.payment_gateway_settings CASCADE;
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_super() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.validate_admin_deletion() CASCADE;
DROP FUNCTION IF EXISTS public.lowercase_email_users() CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_action() CASCADE;

-- Cleanup complete
