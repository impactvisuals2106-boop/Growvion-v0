import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client with fallback values for build time
// This prevents build errors when env vars are not set
// At runtime, if env vars are missing, API routes will handle the error gracefully
const getSupabaseUrl = () => supabaseUrl || 'https://placeholder.supabase.co'
const getSupabaseKey = () => supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(getSupabaseUrl(), getSupabaseKey())

// Client-side Supabase instance
export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !key) {
    throw new Error('Supabase environment variables are not set')
  }
  
  return createClient(url, key)
}


