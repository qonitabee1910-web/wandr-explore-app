-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- PYU-GO Admin Dashboard
-- Created: April 16, 2026
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's admin role
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS VARCHAR AS $$
  SELECT role FROM administrators WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT (SELECT role FROM administrators WHERE id = auth.uid()) = 'super_admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin_or_super()
RETURNS BOOLEAN AS $$
  SELECT (SELECT role FROM administrators WHERE id = auth.uid()) IN ('admin', 'super_admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- ADMINISTRATORS TABLE POLICIES
-- ============================================================================

-- Super admins can see all administrators
CREATE POLICY "super_admin_view_all_admins" ON administrators
  FOR SELECT
  USING (is_super_admin() OR auth.uid() = id);

-- Super admins can create new administrators
CREATE POLICY "super_admin_create_admins" ON administrators
  FOR INSERT
  WITH CHECK (is_super_admin());

-- Super admins and self can update
CREATE POLICY "admin_update_self_or_super_admin" ON administrators
  FOR UPDATE
  USING (is_super_admin() OR auth.uid() = id)
  WITH CHECK (is_super_admin() OR auth.uid() = id);

-- Super admins can delete administrators
CREATE POLICY "super_admin_delete_admins" ON administrators
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PAYMENT GATEWAY SETTINGS POLICIES
-- ============================================================================

-- Admins can view payment settings
CREATE POLICY "admin_view_payment_settings" ON payment_gateway_settings
  FOR SELECT
  USING (is_admin_or_super());

-- Super admins can insert payment settings
CREATE POLICY "super_admin_create_payment_settings" ON payment_gateway_settings
  FOR INSERT
  WITH CHECK (is_super_admin());

-- Super admins can update payment settings
CREATE POLICY "super_admin_update_payment_settings" ON payment_gateway_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Super admins can delete payment settings
CREATE POLICY "super_admin_delete_payment_settings" ON payment_gateway_settings
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- EMAIL SETTINGS POLICIES
-- ============================================================================

-- Admins can view email settings
CREATE POLICY "admin_view_email_settings" ON email_settings
  FOR SELECT
  USING (is_admin_or_super());

-- Super admins can manage email settings
CREATE POLICY "super_admin_insert_email_settings" ON email_settings
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_update_email_settings" ON email_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- PRICING RULES POLICIES
-- ============================================================================

-- Admins can view pricing rules
CREATE POLICY "admin_view_pricing_rules" ON pricing_rules
  FOR SELECT
  USING (is_admin_or_super());

-- Admins can create pricing rules
CREATE POLICY "admin_create_pricing_rules" ON pricing_rules
  FOR INSERT
  WITH CHECK (is_admin_or_super());

-- Admins can update pricing rules
CREATE POLICY "admin_update_pricing_rules" ON pricing_rules
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

-- Admins can delete pricing rules
CREATE POLICY "admin_delete_pricing_rules" ON pricing_rules
  FOR DELETE
  USING (is_admin_or_super());

-- ============================================================================
-- SURGE MULTIPLIERS POLICIES
-- ============================================================================

-- Admins can view surge multipliers
CREATE POLICY "admin_view_surge_multipliers" ON surge_multipliers
  FOR SELECT
  USING (is_admin_or_super());

-- Admins can manage surge multipliers
CREATE POLICY "admin_create_surge_multipliers" ON surge_multipliers
  FOR INSERT
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_update_surge_multipliers" ON surge_multipliers
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY "admin_delete_surge_multipliers" ON surge_multipliers
  FOR DELETE
  USING (is_admin_or_super());

-- ============================================================================
-- PROMOS TABLE POLICIES
-- ============================================================================

-- Admins can view all promos
CREATE POLICY "admin_view_promos" ON promos
  FOR SELECT
  USING (is_admin_or_super());

-- Admins can create promos
CREATE POLICY "admin_create_promos" ON promos
  FOR INSERT
  WITH CHECK (is_admin_or_super());

-- Admins can update promos
CREATE POLICY "admin_update_promos" ON promos
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

-- Super admins can delete promos
CREATE POLICY "super_admin_delete_promos" ON promos
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PROMO USAGE TABLE POLICIES
-- ============================================================================

-- Admins can view promo usage
CREATE POLICY "admin_view_promo_usage" ON promo_usage
  FOR SELECT
  USING (is_admin_or_super());

-- Only system can insert promo usage (no direct admin insert)
CREATE POLICY "system_insert_promo_usage" ON promo_usage
  FOR INSERT
  WITH CHECK (FALSE);

-- ============================================================================
-- ADVERTISEMENTS TABLE POLICIES
-- ============================================================================

-- Admins can view ads
CREATE POLICY "admin_view_advertisements" ON advertisements
  FOR SELECT
  USING (is_admin_or_super());

-- Admins can create ads
CREATE POLICY "admin_create_advertisements" ON advertisements
  FOR INSERT
  WITH CHECK (is_admin_or_super());

-- Admins can update ads
CREATE POLICY "admin_update_advertisements" ON advertisements
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

-- Super admins can delete ads
CREATE POLICY "super_admin_delete_advertisements" ON advertisements
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AD CAMPAIGNS TABLE POLICIES
-- ============================================================================

-- Admins can view campaigns
CREATE POLICY "admin_view_ad_campaigns" ON ad_campaigns
  FOR SELECT
  USING (is_admin_or_super());

-- Admins can create campaigns
CREATE POLICY "admin_create_ad_campaigns" ON ad_campaigns
  FOR INSERT
  WITH CHECK (is_admin_or_super());

-- Admins can update campaigns
CREATE POLICY "admin_update_ad_campaigns" ON ad_campaigns
  FOR UPDATE
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

-- Super admins can delete campaigns
CREATE POLICY "super_admin_delete_ad_campaigns" ON ad_campaigns
  FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AD METRICS TABLE POLICIES
-- ============================================================================

-- Admins can view ad metrics
CREATE POLICY "admin_view_ad_metrics" ON ad_metrics
  FOR SELECT
  USING (is_admin_or_super());

-- Analysts can view ad metrics (read-only)
CREATE POLICY "analyst_view_ad_metrics" ON ad_metrics
  FOR SELECT
  USING (current_admin_role() = 'analyst');

-- System inserts metrics (no direct admin insert)
CREATE POLICY "system_insert_ad_metrics" ON ad_metrics
  FOR INSERT
  WITH CHECK (FALSE);

-- ============================================================================
-- NOTIFICATION TEMPLATES POLICIES
-- ============================================================================

-- Admins can view templates
CREATE POLICY "admin_view_notification_templates" ON notification_templates
  FOR SELECT
  USING (is_admin_or_super());

-- Super admins can manage templates
CREATE POLICY "super_admin_create_notification_templates" ON notification_templates
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "super_admin_update_notification_templates" ON notification_templates
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- APP SETTINGS POLICIES
-- ============================================================================

-- Admins can view app settings
CREATE POLICY "admin_view_app_settings" ON app_settings
  FOR SELECT
  USING (is_admin_or_super());

-- Super admins can update app settings
CREATE POLICY "super_admin_update_app_settings" ON app_settings
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- AUDIT TRIGGER
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users,
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT now()
);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to important tables
CREATE TRIGGER audit_pricing_rules AFTER INSERT OR UPDATE OR DELETE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_promos AFTER INSERT OR UPDATE OR DELETE ON promos
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_advertisements AFTER INSERT OR UPDATE OR DELETE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- ============================================================================
-- End of RLS policies migration
-- ============================================================================
