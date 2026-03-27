import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const emails = ['admin@lisbeyond.com', 'experiences@wotels.com'];
const { data: list } = await admin.auth.admin.listUsers();

for (const email of emails) {
  const user = list.users.find(u => u.email === email);
  if (!user) { console.log('❌ not found:', email); continue; }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, must_change_password: true },
  });
  console.log(error ? `❌ ${email}: ${error.message}` : `✅ ${email} → must_change_password: true`);
}
