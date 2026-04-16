-- ============================================================================
-- INITIAL SCHEMA MIGRATION
-- PYU-GO Admin Dashboard Database
-- Created: April 16, 2026
-- ============================================================================

-- Drop existing tables if they exist (for fresh setup)
-- DROP TABLE IF EXISTS administrators CASCADE;
-- DROP TABLE IF EXISTS admin_roles CASCADE;
-- DROP TABLE IF EXISTS admin_permissions CASCADE;

-- ============================================================================
-- ADMINISTRATORS & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- PAYMENT GATEWAY SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(50) NOT NULL,
  api_key VARCHAR(500) NOT NULL,
  secret_key VARCHAR(500) NOT NULL,
  webhook_url VARCHAR(500),
  is_active BOOLEAN DEFAULT FALSE,
  commission_percentage DECIMAL(5,2) DEFAULT 5,
  settlement_frequency VARCHAR(50) DEFAULT 'daily',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(gateway_name)
);

-- ============================================================================
-- EMAIL SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username VARCHAR(255) NOT NULL,
  smtp_password VARCHAR(500) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  reply_to VARCHAR(255),
  tls_enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables TEXT, -- JSON array of template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(template_type)
);

-- ============================================================================
-- APP SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(255) DEFAULT 'PYU-GO',
  app_version VARCHAR(50),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  max_ride_distance DECIMAL(8,2) DEFAULT 100,
  min_ride_distance DECIMAL(8,2) DEFAULT 1,
  max_surge_multiplier DECIMAL(3,2) DEFAULT 3,
  currency VARCHAR(3) DEFAULT 'IDR',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- PRICING RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50) NOT NULL, -- base_fare, distance_rate, time_rate, surge, promo
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(50) NOT NULL, -- ride, shuttle
  value DECIMAL(10,2) NOT NULL,
  condition_type VARCHAR(50), -- time, distance, location, weather, demand
  condition_value VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_pricing_rules_service_type ON pricing_rules(service_type);
CREATE INDEX idx_pricing_rules_rule_type ON pricing_rules(rule_type);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);

-- ============================================================================
-- SURGE MULTIPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS surge_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_surge_multipliers_active ON surge_multipliers(is_active);
CREATE INDEX idx_surge_multipliers_time ON surge_multipliers(time_start, time_end);

-- ============================================================================
-- PROMOTIONAL CODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  promo_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_ride
  value DECIMAL(10,2) NOT NULL,
  min_ride_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_to VARCHAR(50) DEFAULT 'all', -- all, new_users, specific_users
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, expired
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_promos_code ON promos(code);
CREATE INDEX idx_promos_status ON promos(status);
CREATE INDEX idx_promos_valid_dates ON promos(valid_from, valid_to);

-- ============================================================================
-- PROMO USAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id UUID REFERENCES promos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  ride_id UUID,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_promo_usage_promo_id ON promo_usage(promo_id);
CREATE INDEX idx_promo_usage_user_id ON promo_usage(user_id);
CREATE INDEX idx_promo_usage_used_at ON promo_usage(used_at);

-- ============================================================================
-- ADVERTISEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  ad_link VARCHAR(500),
  placement VARCHAR(50) NOT NULL, -- home_banner, ride_screen, booking_page, result_page
  ad_type VARCHAR(50) NOT NULL, -- image, video, carousel
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2), -- Click-through rate
  status VARCHAR(50) DEFAULT 'active', -- active, paused, archived
  campaign_id UUID,
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_placement ON advertisements(placement);
CREATE INDEX idx_advertisements_campaign_id ON advertisements(campaign_id);

-- ============================================================================
-- AD CAMPAIGNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(15,2) NOT NULL,
  spent DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planning', -- planning, active, paused, completed
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  target_audience TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);

-- ============================================================================
-- AD METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  cost_per_click DECIMAL(10,2),
  cost_per_conversion DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(ad_id, date)
);

CREATE INDEX idx_ad_metrics_ad_id ON ad_metrics(ad_id);
CREATE INDEX idx_ad_metrics_date ON ad_metrics(date);

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert default roles
INSERT INTO admin_roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Administrative access'),
  ('moderator', 'Moderation access'),
  ('analyst', 'Analytics and reporting only')
ON CONFLICT (name) DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (app_name, app_version) VALUES
  ('PYU-GO', '1.0.0')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_active ON payment_gateway_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_resource_action ON admin_permissions(resource, action);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE administrators IS 'Admin users who manage the platform';
COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules for rides and shuttles';
COMMENT ON TABLE promos IS 'Promotional codes and campaigns';
COMMENT ON TABLE advertisements IS 'Advertisement placements and campaigns';
COMMENT ON TABLE payment_gateway_settings IS 'Payment provider configurations';
COMMENT ON TABLE email_settings IS 'Email SMTP configuration';

-- ============================================================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- End of migration
-- ============================================================================
