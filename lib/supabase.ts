import { createClient } from '@supabase/supabase-js';

// Same Supabase instance as the website — both projects share the same DB
const supabaseUrl = 'https://hnivuisqktlrusyqywaz.supabase.co';

// ⚠️  ANON key — RLS policies are enforced. Replace with your project's anon key
// from: Supabase Dashboard → Settings → API → anon public
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});
