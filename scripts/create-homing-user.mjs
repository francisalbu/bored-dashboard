/**
 * Creates the Homing hotel user and links them to the dashboard.
 *
 * Usage:
 *   node scripts/create-homing-user.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USER_EMAIL    = 'homing@boredtourist.com'; // ← email do utilizador Homing
const USER_PASSWORD = 'Homing2026!';             // ← password temporária
const USER_NAME     = 'Homing Manager';
const HOTEL_ID      = 'homing';
const HOTEL_ROLE    = 'admin';
// ───────────────────────────────────────────────────────────────────────────

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\n🚀  Creating user: ${USER_EMAIL} → hotel: ${HOTEL_ID}\n`);

  // 1 ─ Verify hotel exists
  const { data: hotel, error: hotelError } = await admin
    .from('hotel_config')
    .select('id, name')
    .eq('id', HOTEL_ID)
    .single();

  if (hotelError || !hotel) {
    console.error(`❌  Hotel "${HOTEL_ID}" not found in hotel_config.`);
    console.error(`    Run add-homing-hotel.sql in Supabase first.\n`);
    process.exit(1);
  }
  console.log(`✅  Hotel found: ${hotel.name} (${hotel.id})`);

  // 2 ─ Create auth user
  let userId;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: USER_EMAIL,
    password: USER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: USER_NAME },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️   User already exists — fetching existing id...');
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === USER_EMAIL);
      if (!existing) { console.error('Could not find existing user.'); process.exit(1); }
      userId = existing.id;
    } else {
      console.error('❌  Auth error:', authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log(`✅  Auth user created → ${userId}`);
  }

  // 3 ─ Upsert dashboard_users profile
  const { error: profileError } = await admin
    .from('dashboard_users')
    .upsert(
      { id: userId, email: USER_EMAIL, full_name: USER_NAME, role: 'hotel_admin' },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error('❌  Could not upsert dashboard_users:', profileError.message);
    process.exit(1);
  }
  console.log(`✅  Profile set → role: hotel_admin`);

  // 4 ─ Assign hotel
  const { error: assignError } = await admin
    .from('dashboard_user_hotels')
    .upsert(
      { user_id: userId, hotel_id: HOTEL_ID, role: HOTEL_ROLE },
      { onConflict: 'user_id,hotel_id' }
    );

  if (assignError) {
    console.error('❌  Could not assign hotel:', assignError.message);
    process.exit(1);
  }
  console.log(`✅  Assigned to hotel: ${HOTEL_ID} (${HOTEL_ROLE})\n`);

  console.log('─────────────────────────────────────────────────────');
  console.log(`  Hotel     ${hotel.name}`);
  console.log(`  Domain    homing.boredtourist.com`);
  console.log(`  Email     ${USER_EMAIL}`);
  console.log(`  Password  ${USER_PASSWORD}`);
  console.log(`  Role      ${HOTEL_ROLE}`);
  console.log(`  Login     https://bored-experience.dashboard`);
  console.log('─────────────────────────────────────────────────────');
  console.log('\n⚠️   Ask the Homing team to change the password on first login.\n');
}

run();
