-- =============================================================================
-- MSR Next Gen — Supabase PostgreSQL Database Schema
-- Host: pogmewzbzfjasqdsdwbi.supabase.co
-- Generated: October 2026
-- Compatible with Free-Tier Supabase & Next.js App Router
-- =============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LEADS TABLE (CRM, WhatsApp Bot Conversations & Consultative Mind)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255),
    business_name VARCHAR(255),
    category VARCHAR(128),
    budget VARCHAR(128),
    pain_point TEXT,
    website_url TEXT,
    audit_findings TEXT,
    stage VARCHAR(64) DEFAULT 'new_inquiry',
    meeting_state VARCHAR(64) DEFAULT 'none',
    psychology_notes TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    last_active BIGINT,
    alert_sent_to_owner BOOLEAN DEFAULT false,
    notes TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant phone number lookups
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);

-- 3. ORDERS TABLE (Razorpay Transactions & Gateway Audit Trail)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razorpay_order_id VARCHAR(128) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(128),
    package_id VARCHAR(128) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'INR',
    status VARCHAR(64) DEFAULT 'payment_pending',
    client_name VARCHAR(255),
    client_phone VARCHAR(32) NOT NULL,
    client_email VARCHAR(255),
    business_category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_phone ON public.orders(client_phone);

-- 4. CLIENT ONBOARDING TABLE (Post-Payment Setup Questionnaire)
CREATE TABLE IF NOT EXISTS public.client_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128),
    client_phone VARCHAR(32) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(128) NOT NULL,
    address TEXT,
    google_maps_link TEXT,
    instagram_handle VARCHAR(128),
    manager_phone VARCHAR(32),
    staff_phone VARCHAR(32),
    assets_urls TEXT[],
    menu_or_services_doc TEXT,
    status VARCHAR(64) DEFAULT 'onboarding_pending',
    owner_approved BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_phone ON public.client_onboarding(client_phone);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Service Role bypasses RLS for server-side Next.js route handlers.
-- Public anon client has read-only or restricted access to avoid data leakage.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;

-- Allow server route handlers with service role full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'service_role_all_leads'
    ) THEN
        CREATE POLICY service_role_all_leads ON public.leads
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'service_role_all_orders'
    ) THEN
        CREATE POLICY service_role_all_orders ON public.orders
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_onboarding' AND policyname = 'service_role_all_onboarding'
    ) THEN
        CREATE POLICY service_role_all_onboarding ON public.client_onboarding
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END
$$;
