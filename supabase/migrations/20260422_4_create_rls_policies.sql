-- ============================================================================
-- Create RLS Policies
-- PYU-GO Platform
-- ============================================================================

-- ============================================================================
-- ADMIN HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin',
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin'),
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;

-- ============================================================================
-- ADMIN AUDIT LOGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (
  is_admin_or_super() AND 
  (admin_id = auth.uid() OR is_super_admin())
);

CREATE POLICY "Admins can create audit logs"
ON public.admin_audit_logs FOR INSERT
WITH CHECK (is_admin_or_super() AND admin_id = auth.uid());

-- ============================================================================
-- PAYMENT GATEWAY SETTINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_payment_settings" ON public.payment_gateway_settings;
DROP POLICY IF EXISTS "super_admin_create_payment_settings" ON public.payment_gateway_settings;
DROP POLICY IF EXISTS "super_admin_update_payment_settings" ON public.payment_gateway_settings;
DROP POLICY IF EXISTS "super_admin_delete_payment_settings" ON public.payment_gateway_settings;

CREATE POLICY "admin_view_payment_settings" ON public.payment_gateway_settings
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "super_admin_create_payment_settings" ON public.payment_gateway_settings
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_update_payment_settings" ON public.payment_gateway_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_delete_payment_settings" ON public.payment_gateway_settings
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- EMAIL SETTINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_email_settings" ON public.email_settings;
DROP POLICY IF EXISTS "super_admin_insert_email_settings" ON public.email_settings;
DROP POLICY IF EXISTS "super_admin_update_email_settings" ON public.email_settings;

CREATE POLICY "admin_view_email_settings" ON public.email_settings
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "super_admin_insert_email_settings" ON public.email_settings
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_update_email_settings" ON public.email_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- APP SETTINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "super_admin_update_app_settings" ON public.app_settings;

CREATE POLICY "admin_view_app_settings" ON public.app_settings
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "super_admin_update_app_settings" ON public.app_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- PRICING RULES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_pricing_rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "admin_create_pricing_rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "admin_update_pricing_rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "admin_delete_pricing_rules" ON public.pricing_rules;

CREATE POLICY "admin_view_pricing_rules" ON public.pricing_rules
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "admin_create_pricing_rules" ON public.pricing_rules
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_pricing_rules" ON public.pricing_rules
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_delete_pricing_rules" ON public.pricing_rules
  FOR DELETE
  USING (is_admin_or_super());

-- ============================================================================
-- SURGE MULTIPLIERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_surge_multipliers" ON public.surge_multipliers;
DROP POLICY IF EXISTS "admin_create_surge_multipliers" ON public.surge_multipliers;
DROP POLICY IF EXISTS "admin_update_surge_multipliers" ON public.surge_multipliers;
DROP POLICY IF EXISTS "admin_delete_surge_multipliers" ON public.surge_multipliers;

CREATE POLICY "admin_view_surge_multipliers" ON public.surge_multipliers
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "admin_create_surge_multipliers" ON public.surge_multipliers
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_surge_multipliers" ON public.surge_multipliers
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_delete_surge_multipliers" ON public.surge_multipliers
  FOR DELETE
  USING (is_admin_or_super());

-- ============================================================================
-- PROMOS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_promos" ON public.promos;
DROP POLICY IF EXISTS "admin_create_promos" ON public.promos;
DROP POLICY IF EXISTS "admin_update_promos" ON public.promos;
DROP POLICY IF EXISTS "super_admin_delete_promos" ON public.promos;

CREATE POLICY "admin_view_promos" ON public.promos
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "admin_create_promos" ON public.promos
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_promos" ON public.promos
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "super_admin_delete_promos" ON public.promos
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- ADVERTISEMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "admin_create_advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "admin_update_advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "super_admin_delete_advertisements" ON public.advertisements;

CREATE POLICY "admin_view_advertisements" ON public.advertisements
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "admin_create_advertisements" ON public.advertisements
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_advertisements" ON public.advertisements
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "super_admin_delete_advertisements" ON public.advertisements
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AD CAMPAIGNS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_create_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_update_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "super_admin_delete_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "admin_view_ad_campaigns" ON public.ad_campaigns
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "admin_create_ad_campaigns" ON public.ad_campaigns
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_ad_campaigns" ON public.ad_campaigns
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "super_admin_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AD METRICS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_ad_metrics" ON public.ad_metrics;
DROP POLICY IF EXISTS "system_insert_ad_metrics" ON public.ad_metrics;

CREATE POLICY "admin_view_ad_metrics" ON public.ad_metrics
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "system_insert_ad_metrics" ON public.ad_metrics
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- NOTIFICATION TEMPLATES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "admin_view_notification_templates" ON public.notification_templates;
DROP POLICY IF EXISTS "super_admin_create_notification_templates" ON public.notification_templates;
DROP POLICY IF EXISTS "super_admin_update_notification_templates" ON public.notification_templates;

CREATE POLICY "admin_view_notification_templates" ON public.notification_templates
  FOR SELECT
  USING (is_admin_or_super());

CREATE POLICY "super_admin_create_notification_templates" ON public.notification_templates
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_update_notification_templates" ON public.notification_templates
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- RIDES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_can_view_own_rides" ON public.rides;
DROP POLICY IF EXISTS "drivers_can_view_own_rides" ON public.rides;
DROP POLICY IF EXISTS "users_can_create_rides" ON public.rides;
DROP POLICY IF EXISTS "admins_can_view_all_rides" ON public.rides;

CREATE POLICY "users_can_view_own_rides" ON public.rides
  FOR SELECT
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id OR is_admin_or_super());

CREATE POLICY "users_can_create_rides" ON public.rides
  FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "users_can_update_own_rides" ON public.rides
  FOR UPDATE
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id OR is_admin_or_super())
  WITH CHECK (auth.uid() = passenger_id OR auth.uid() = driver_id OR is_admin_or_super());

-- ============================================================================
-- RIDE LOCATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_can_view_ride_locations" ON public.ride_locations;
DROP POLICY IF EXISTS "system_can_insert_ride_locations" ON public.ride_locations;

CREATE POLICY "users_can_view_ride_locations" ON public.ride_locations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT passenger_id FROM public.rides WHERE id = ride_id
      UNION
      SELECT driver_id FROM public.rides WHERE id = ride_id
    ) OR is_admin_or_super()
  );

CREATE POLICY "system_can_insert_ride_locations" ON public.ride_locations
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- DRIVER DOCUMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "drivers_can_view_own_documents" ON public.driver_documents;
DROP POLICY IF EXISTS "admins_can_view_all_documents" ON public.driver_documents;

CREATE POLICY "drivers_can_view_own_documents" ON public.driver_documents
  FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "admins_can_view_all_documents" ON public.driver_documents
  FOR SELECT
  USING (is_admin_or_super());

-- ============================================================================
-- RATINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_can_view_driver_ratings" ON public.driver_ratings;
DROP POLICY IF EXISTS "users_can_create_driver_ratings" ON public.driver_ratings;

CREATE POLICY "users_can_view_driver_ratings" ON public.driver_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "users_can_create_driver_ratings" ON public.driver_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

-- ============================================================================
-- SHUTTLE BOOKINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_can_view_own_bookings" ON public.shuttle_bookings;
DROP POLICY IF EXISTS "users_can_create_bookings" ON public.shuttle_bookings;

CREATE POLICY "users_can_view_own_bookings" ON public.shuttle_bookings
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_super());

CREATE POLICY "users_can_create_bookings" ON public.shuttle_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON FUNCTION public.is_super_admin() IS 'Check if current user is super_admin';
COMMENT ON FUNCTION public.is_admin_or_super() IS 'Check if current user is admin or super_admin';
COMMENT ON FUNCTION public.get_current_user_role() IS 'Get current user role';
