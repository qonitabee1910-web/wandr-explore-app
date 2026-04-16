-- Fare System Database Schema
-- Version: 1.0.0
-- Description: Schema for Shuttle Fare Calculation Module

-- 1. Fare Rules Table
CREATE TABLE fare_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rayon_id UUID NOT NULL,
    base_fare DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    per_km_rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_charge DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- JSONB storage for flexible multipliers
    service_multipliers JSONB NOT NULL DEFAULT '{"Regular": 1.0, "Semi Executive": 1.5, "Executive": 2.0}',
    vehicle_multipliers JSONB NOT NULL DEFAULT '{"Mini Car": 1.0, "SUV": 1.2, "Hiace": 1.5}',
    passenger_multipliers JSONB NOT NULL DEFAULT '{"adult": 1.0, "child": 0.75, "senior": 0.85}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Surge Rules Table
CREATE TABLE surge_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INTEGER[] NOT NULL, -- 0-6 (Sunday-Saturday)
    multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Promo Codes Table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(12, 2) NOT NULL,
    min_spend DECIMAL(12, 2) DEFAULT 0.00,
    max_discount DECIMAL(12, 2),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transaction Logs Table (Audit Trail)
CREATE TABLE fare_transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID, -- Optional if log happens before booking
    rayon_id UUID NOT NULL,
    distance_km DECIMAL(10, 2) NOT NULL,
    service_tier VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    
    -- Full calculation breakdown stored as JSONB
    calculation_details JSONB NOT NULL,
    
    total_fare DECIMAL(12, 2) NOT NULL,
    promo_applied VARCHAR(50),
    surge_applied VARCHAR(100),
    
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_fare_rules_rayon ON fare_rules(rayon_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code) WHERE is_active = TRUE;
CREATE INDEX idx_surge_rules_active ON surge_rules(is_active);
CREATE INDEX idx_fare_logs_created ON fare_transaction_logs(created_at);
