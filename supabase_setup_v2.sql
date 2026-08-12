-- =========================================================================
-- GROWVEX ANALYTICS PLATFORM SCHEMA (V2) - PRODUCTION READY
-- Multi-Tenant, High Performance, Secure PostgreSQL Database Setup.
-- Copy and paste this script directly into your Supabase SQL Editor.
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. Table: services
-- Represents registered Growvex sub-services / platforms (Multi-tenant context).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,                       -- e.g., 'Growvex Landing', 'Impact Visuals', 'Academy'
    slug TEXT NOT NULL UNIQUE,                       -- URL-friendly identifier (e.g., 'growvex', 'impactvisuals')
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Register default services
INSERT INTO public.services (name, slug, description) VALUES
('Growvex Landing', 'growvex', 'Main startup marketing website'),
('Impact Visuals', 'impactvisuals', 'Content & media production portal')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. Table: visitors
-- Analytics visitor profile (tracks uniques and geographics).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    visitor_hash TEXT NOT NULL,                      -- Privacy-safe browser signature hash
    ip_hash TEXT,                                    -- Cryptographic IP signature hash (GDPR compliant)
    device_type TEXT,                                -- desktop, mobile, tablet
    browser TEXT,                                    -- Chrome, Safari, etc.
    os TEXT,                                         -- Windows, macOS, etc.
    resolution TEXT,                                 -- 1920x1080
    language TEXT,                                   -- en-US
    timezone TEXT,                                   -- Asia/Kolkata
    country TEXT,                                    -- India
    region TEXT,                                     -- California
    city TEXT,                                       -- San Francisco
    is_returning BOOLEAN DEFAULT FALSE,              -- True if cookie found from previous visit
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT unique_visitor_per_service UNIQUE (service_id, visitor_hash)
);

-- -------------------------------------------------------------------------
-- 3. Table: page_views
-- Logs paths visited by users within their sessions.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,                        -- Session grouping identifier
    path TEXT NOT NULL,                              -- /services
    referrer TEXT,                                   -- referrer origin / search引擎
    time_spent_seconds INT DEFAULT 0,                -- tracked time spent on page
    is_entry BOOLEAN DEFAULT FALSE,
    is_exit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -------------------------------------------------------------------------
-- 4. Table: button_clicks
-- Captures custom Element click interactions.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.button_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    button_name TEXT NOT NULL,                       -- e.g., 'Hero CTA', 'Visit Impact Visuals'
    page_path TEXT NOT NULL,                         -- page where click occurred
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -------------------------------------------------------------------------
-- 5. Table: contact_messages
-- Captured lead inquiries.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT NOT NULL,
    website_source TEXT,                             -- e.g., referrer url or sub-service name
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -------------------------------------------------------------------------
-- 6. Table: analytics_daily
-- Pre-aggregated statistical rows used to power dashboard charts instantly.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_page_views INT DEFAULT 0,
    total_visitors INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    returning_visitors INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    total_leads INT DEFAULT 0,
    avg_session_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT unique_daily_metrics_per_service UNIQUE (service_id, date)
);

-- -------------------------------------------------------------------------
-- 7. Table: event_logs
-- Systems diagnostics dashboard tracker.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,                          -- ERROR, WARN, INFO
    source TEXT NOT NULL,                            -- e.g., 'API Route: track', 'Client SDK'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- INDEX OPTIMIZATIONS FOR POWER-SEARCHES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_visitors_service_hash ON public.visitors(service_id, visitor_hash);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_service ON public.page_views(service_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_service_created ON public.button_clicks(service_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_date ON public.analytics_daily(date DESC);

-- =========================================================================
-- UPDATED_AT TRIGGER DEFINITION
-- =========================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER trigger_update_visitors BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER trigger_update_pageviews BEFORE UPDATE ON public.page_views FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER trigger_update_clicks BEFORE UPDATE ON public.button_clicks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER trigger_update_contact BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER trigger_update_daily BEFORE UPDATE ON public.analytics_daily FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- Lock down all tables. External APIs run using Supabase service_role keys.
-- =========================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.button_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Block public queries completely on administrative tables
CREATE POLICY "RLS Service Access ONLY" ON public.services FOR ALL USING (false);
CREATE POLICY "RLS Service Access ONLY" ON public.analytics_daily FOR ALL USING (false);
CREATE POLICY "RLS Service Access ONLY" ON public.event_logs FOR ALL USING (false);

-- Allow anonymous inserts for frontend database logging, while blocking public reads/updates/deletes
CREATE POLICY "Allow public insert to visitors" ON public.visitors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert to page_views" ON public.page_views FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert to button_clicks" ON public.button_clicks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert to contact_messages" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
