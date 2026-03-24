import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node --env-file=.env scripts/_reset-password.mjs <email> <new-password>');
  process.exit(1);
}

const { data } = await admin.auth.admin.listUsers();
const user = data?.users?.find(u => u.email === email);

if (!user) {
  console.log('User not found:', email);
  process.exit(1);
}

const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword });

if (error) {
  console.log('Error:', error.message);
} else {
  console.log(`✓ Password for ${email} updated to: ${newPassword}`);
}
