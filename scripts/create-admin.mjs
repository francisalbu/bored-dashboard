/**
 * One-time setup script — creates the first super admin account.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in your keys
 *   2. Run: node --env-file=.env scripts/create-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL       = 'francisco@boredtourist.com';
const ADMIN_PASSWORD    = 'ChangeMe123!';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing env vars. Run: node --env-file=.env scripts/create-admin.mjs\n');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🚀  Creating super admin: ${ADMIN_EMAIL} …\n`);

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Super Admin' },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️   User already exists — fetching existing id...');
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) { console.error('Could not find existing user.'); process.exit(1); }
      await promoteToSuperAdmin(existing.id);
    } else {
      console.error('❌  Auth error:', authError.message);
      process.exit(1);
    }
    return;
  }

  console.log(`✅  Auth user created  →  ${authData.user.id}`);
  await promoteToSuperAdmin(authData.user.id);
}

async function promoteToSuperAdmin(userId) {
  const { error } = await admin
    .from('dashboard_users')
    .upsert({ id: userId, email: ADMIN_EMAIL, role: 'super_admin' }, { onConflict: 'id' });

  if (error) { console.error('❌  Could not set role:', error.message); process.exit(1); }

  console.log('✅  Role set to super_admin\n');
  console.log(`  Email     ${ADMIN_EMAIL}`);
  console.log(`  Password  ${ADMIN_PASSWORD}`);
  console.log('\n⚠️   Change the password after your first login.\n');
}

main();
