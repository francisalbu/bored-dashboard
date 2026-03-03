/**
 * One-time setup script — creates the first super admin account.
 *
 * Usage:
 *   1. Paste your SERVICE ROLE key below (Supabase → Settings → API)
 *   2. Set the email & password you want
 *   3. Run:  node scripts/create-admin.mjs
 *
 * The script:
 *   - Creates the user in Supabase Auth (email confirmed, no verification email)
 *   - Promotes them to super_admin in dashboard_users
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config — edit these three lines ─────────────────────────────────────────
const SUPABASE_URL      = 'https://hnivuisqktlrusyqywaz.supabase.co';
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaXZ1aXNxa3RscnVzeXF5d2F6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE3MTY3OCwiZXhwIjoyMDc4NzQ3Njc4fQ.gGLIYOJgNvm_LnsOm87LMCMAd0qgoJt1owpDY-DrjNw'; // Supabase → Settings → API → service_role secret
const ADMIN_EMAIL       = 'francisco@boredtourist.com';       // your email
const ADMIN_PASSWORD    = 'ChangeMe123!';                     // temporary password
// ─────────────────────────────────────────────────────────────────────────────

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('\n❌  Please paste your service_role key into the script first.\n');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🚀  Creating super admin: ${ADMIN_EMAIL} …\n`);

  // 1 ─ Create auth user (email_confirm: true = skip confirmation email)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Super Admin' },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️   User already exists in auth.users — skipping creation.');

      // Fetch existing user id
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
  // The on_auth_user_created trigger should have already inserted a row.
  // We upsert just in case, then set role = super_admin.
  const { error: upsertError } = await admin
    .from('dashboard_users')
    .upsert({ id: userId, email: ADMIN_EMAIL, role: 'super_admin' }, { onConflict: 'id' });

  if (upsertError) {
    console.error('❌  Could not set role:', upsertError.message);
    process.exit(1);
  }

  console.log('✅  Role set to super_admin\n');
  console.log('──────────────────────────────────────────');
  console.log('  URL       https://bored-tourist-hotel-edition.vercel.app');
  console.log(`  Email     ${ADMIN_EMAIL}`);
  console.log(`  Password  ${ADMIN_PASSWORD}`);
  console.log('──────────────────────────────────────────');
  console.log('\n⚠️   Change the password after your first login.\n');
}

main();
