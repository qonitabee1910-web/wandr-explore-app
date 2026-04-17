-- ============================================================================
-- Create Admin Tables & Settings
-- PYU-GO Platform
-- ============================================================================

-- ============================================================================
-- ADMIN AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_resource ON public.admin_audit_logs(resource_type);
CREATE INDEX idx_admin_audit_logs_created ON public.admin_audit_logs(created_at);

-- ============================================================================
-- PAYMENT GATEWAY SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(50) NOT NULL UNIQUE,
  api_key VARCHAR(500) NOT NULL,
  secret_key VARCHAR(500) NOT NULL,
  webhook_url VARCHAR(500),
  is_active BOOLEAN DEFAULT FALSE,
  commission_percentage DECIMAL(5,2) DEFAULT 5,
  settlement_frequency VARCHAR(50) DEFAULT 'daily',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payment_gateway_active ON public.payment_gateway_settings(is_active);

-- ============================================================================
-- EMAIL SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username VARCHAR(255) NOT NULL,
  smtp_password VARCHAR(500) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  reply_to VARCHAR(255),
  tls_enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APP SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(255) DEFAULT 'PYU-GO',
  app_version VARCHAR(50),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  max_ride_distance DECIMAL(8,2) DEFAULT 100,
  min_ride_distance DECIMAL(8,2) DEFAULT 1,
  max_surge_multiplier DECIMAL(3,2) DEFAULT 3,
  currency VARCHAR(3) DEFAULT 'IDR',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRICING RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  condition_type VARCHAR(50),
  condition_value VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_pricing_rules_service_type ON public.pricing_rules(service_type);
CREATE INDEX idx_pricing_rules_rule_type ON public.pricing_rules(rule_type);
CREATE INDEX idx_pricing_rules_active ON public.pricing_rules(is_active);

-- ============================================================================
-- SURGE MULTIPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.surge_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.surge_multipliers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_surge_multipliers_active ON public.surge_multipliers(is_active);
CREATE INDEX idx_surge_multipliers_time ON public.surge_multipliers(time_start, time_end);

-- ============================================================================
-- PROMOTIONAL CODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  promo_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_ride_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_to VARCHAR(50) DEFAULT 'all',
  status VARCHAR(50) DEFAULT 'active',
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_promos_code ON public.promos(code);
CREATE INDEX idx_promos_status ON public.promos(status);
CREATE INDEX idx_promos_valid_dates ON public.promos(valid_from, valid_to);

-- ============================================================================
-- PROMO USAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.promo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id UUID REFERENCES public.promos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  ride_id UUID,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.promo_usage ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_promo_usage_promo_id ON public.promo_usage(promo_id);
CREATE INDEX idx_promo_usage_user_id ON public.promo_usage(user_id);
CREATE INDEX idx_promo_usage_used_at ON public.promo_usage(used_at);

-- ============================================================================
-- ADVERTISEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  ad_link VARCHAR(500),
  placement VARCHAR(50) NOT NULL,
  ad_type VARCHAR(50) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active',
  campaign_id UUID,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_advertisements_status ON public.advertisements(status);
CREATE INDEX idx_advertisements_placement ON public.advertisements(placement);
CREATE INDEX idx_advertisements_campaign_id ON public.advertisements(campaign_id);

-- ============================================================================
-- AD CAMPAIGNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(15,2) NOT NULL,
  spent DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planning',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);

-- ============================================================================
-- AD METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  cost_per_click DECIMAL(10,2),
  cost_per_conversion DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_id, date)
);

ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ad_metrics_ad_id ON public.ad_metrics(ad_id);
CREATE INDEX idx_ad_metrics_date ON public.ad_metrics(date);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

INSERT INTO public.app_settings (app_name, app_version) 
VALUES ('PYU-GO', '1.0.0')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.admin_audit_logs IS 'Audit trail for admin actions';
COMMENT ON TABLE public.pricing_rules IS 'Dynamic pricing rules for rides';
COMMENT ON TABLE public.promos IS 'Promotional codes and campaigns';
COMMENT ON TABLE public.advertisements IS 'Advertisement placements';
