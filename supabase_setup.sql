-- =========================================================================
-- GROWVEX ANALYTICS DATABASE SCHEMA
-- This script contains all necessary table definitions, indexes, and constraints
-- to support a production-grade Web Analytics & Business Intelligence System.
-- Copy and paste this script directly into your Supabase SQL Editor.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Table: analytics_sessions
-- Stores metadata about each visitor session, location, routing, and duration.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,                         -- Client-side unique hash identifying the browser instance
    ip_hash TEXT,                                     -- SHA-256 hashed client IP (GDPR privacy-compliant)
    device TEXT,                                      -- mobile, tablet, desktop
    browser TEXT,                                     -- e.g., Chrome, Safari, Firefox
    os TEXT,                                          -- e.g., Windows, macOS, iOS, Android
    resolution TEXT,                                  -- Screen resolution (e.g., 1920x1080)
    language TEXT,                                    -- Preferred browser language (e.g., en-US)
    timezone TEXT,                                    -- Timezone offset / locale (e.g., Asia/Kolkata)
    country TEXT,                                     -- Country derived from IP (e.g., India)
    region TEXT,                                      -- State/Region derived from IP (e.g., Andhra Pradesh)
    city TEXT,                                        -- City derived from IP (e.g., Visakhapatnam)
    isp TEXT,                                         -- Internet Service Provider of user
    traffic_source TEXT DEFAULT 'Direct',            -- Direct, Search Engines, Referral sites, Social Media
    utm_source TEXT,                                  -- Campaign source
    utm_medium TEXT,                                  -- Campaign medium
    utm_campaign TEXT,                                -- Campaign name
    entry_page TEXT DEFAULT '/',                      -- Entry point path
    exit_page TEXT DEFAULT '/',                       -- Exit point path
    scroll_percentage INT DEFAULT 0,                  -- Highest scroll depth recorded in percentage (0-100)
    duration INT DEFAULT 0,                           -- Active session duration in seconds
    alert_5m_sent BOOLEAN DEFAULT FALSE,               -- Track if 5-minute session alert was emailed
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comment explanations
COMMENT ON TABLE public.analytics_sessions IS 'Stores metadata for distinct visitor sessions, including geolocation and device specifications.';
COMMENT ON COLUMN public.analytics_sessions.visitor_id IS 'Unique client signature generated in local storage to track returning visitors across multiple sessions.';
COMMENT ON COLUMN public.analytics_sessions.ip_hash IS 'SHA-256 of visitor IP address for GDPR compliance.';

-- -------------------------------------------------------------------------
-- 2. Table: analytics_page_views
-- Logs each page navigation event during a session.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL,                               -- Navigated path (e.g., /services, /admin)
    referrer TEXT,                                    -- Page referer URL
    time_spent INT DEFAULT 0,                         -- Total seconds spent on this page view
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.analytics_page_views IS 'Logs specific page views per session, tracking user routing paths.';

-- -------------------------------------------------------------------------
-- 3. Table: analytics_clicks
-- Tracks custom element click-events (buttons, links, CTAs).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_clicks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL DEFAULT '/',              -- Page where click happened
    button_name TEXT NOT NULL,                        -- Name describing the button (e.g., Hero "Get Started", WhatsApp)
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.analytics_clicks IS 'Logs user click interactions with critical links and CTA elements.';

-- -------------------------------------------------------------------------
-- 4. Table: analytics_contact_submissions
-- Stores records from the Growvex contact feedback form.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_contact_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID REFERENCES public.analytics_sessions(id) ON DELETE SET NULL, -- Connect submission to visitor session
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'success',                    -- success, failed (e.g., SMTP notification failed)
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.analytics_contact_submissions IS 'Captures and stores client leads via the Contact form.';

-- =========================================================================
-- INDEX OPTIMIZATIONS FOR HIGH-PERFORMANCE ANALYTICS
-- Speed up calculations for timeframes (Today, 7D, 30D), location counts, and links.
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.analytics_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.analytics_sessions (visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_geo ON public.analytics_sessions (country, region, city);
CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON public.analytics_page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON public.analytics_page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_session_id ON public.analytics_clicks (session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON public.analytics_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.analytics_contact_submissions (created_at DESC);

-- =========================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- Automatic update trigger for the updated_at column on session updates.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_sessions_timestamp
    BEFORE UPDATE ON public.analytics_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Secure the tables. Allows the API server to perform operations via
-- the service_role key, while denying select/delete access to normal users.
-- =========================================================================
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy definitions for authenticated (Admin) vs client actions.
-- Anonymous ingestion: Vercel serverless function uses service_role key, bypassing RLS.
-- This keeps configurations extremely secure by locking public client access completely.
CREATE POLICY "Deny general public access to sessions" ON public.analytics_sessions
    FOR ALL USING (false);

CREATE POLICY "Deny general public access to page views" ON public.analytics_page_views
    FOR ALL USING (false);

CREATE POLICY "Deny general public access to clicks" ON public.analytics_clicks
    FOR ALL USING (false);

CREATE POLICY "Deny general public access to contact submissions" ON public.analytics_contact_submissions
    FOR ALL USING (false);
