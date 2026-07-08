import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Growvion Client SDK]: Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
    'The Supabase SDK client will initialize as null and run in offline/fallback mode.'
  );
}

// Instantiate database client safely to allow page mounting even if environment variables are not locally populated.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
