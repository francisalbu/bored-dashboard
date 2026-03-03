import { createClient } from '@supabase/supabase-js';

// Same Supabase instance as the website — both projects share the same DB
const supabaseUrl = 'https://hnivuisqktlrusyqywaz.supabase.co';

// ⚠️  ANON key — RLS policies are enforced. Replace with your project's anon key
// from: Supabase Dashboard → Settings → API → anon public
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaXZ1aXNxa3RscnVzeXF5d2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNzE2NzgsImV4cCI6MjA3ODc0NzY3OH0.amqHQkxh9tun5cIHUJN23ocGImZek6QfoSGpLDSUhDA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Redirect back to the dashboard after OAuth / magic-link flows
    flowType: 'pkce',
  },
});
