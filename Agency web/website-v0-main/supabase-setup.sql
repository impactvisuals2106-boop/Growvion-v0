-- Supabase Database Setup for Impact Visuals
-- Run this in Supabase SQL Editor

-- Create the leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security (optional - disable if you want open access)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (for admin dashboard)
-- Only use this if RLS is enabled
-- CREATE POLICY "Allow all operations on leads" ON leads
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- Optional: Add email validation
ALTER TABLE leads ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');




