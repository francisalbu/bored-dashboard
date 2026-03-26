/**
 * Creates the Lisbeyond hotel + admin user.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-lisbeyond-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HOTEL_ID      = 'lisbeyond';
const HOTEL_NAME    = 'Lisbeyond';
const USER_EMAIL    = 'admin@lisbeyond.com';
const USER_PASSWORD = 'Lisbeyond2026!';
const USER_NAME     = 'Lisbeyond Admin';
const HOTEL_ROLE    = 'owner';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\n🏨  Lisbeyond — Setup`);
  console.log(`    Hotel : ${HOTEL_ID}`);
  console.log(`    User  : ${USER_EMAIL}\n`);

  // ── 1. Insert hotel_config (idempotent) ───────────────────────────────────
  const { error: hotelError } = await admin
    .from('hotel_config')
    .upsert(
      {
        id       : HOTEL_ID,
        name     : HOTEL_NAME,
        tagline  : 'The soul of Lisbon, beyond the ordinary',
        location : 'Lisboa',
        latitude : 38.7169,
        longitude: -9.1399,
        subdomain: 'lisbeyond',
        theme: {
          primaryColor    : '#1a1a1a',
          primaryTextColor: '#ffffff',
          accentColor     : '#c8873a',
          backgroundColor : '#FAFAF8',
          surfaceColor    : '#ffffff',
          fontHeading     : 'Inter',
          fontBody        : 'Inter',
        },
      },
      { onConflict: 'id' }
    );

  if (hotelError) {
    console.error('❌  Could not upsert hotel_config:', hotelError.message);
    process.exit(1);
  }
  console.log(`✅  Hotel "${HOTEL_NAME}" ready in hotel_config`);

  // ── 2. Create (or find) auth user ─────────────────────────────────────────
  let userId;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email         : USER_EMAIL,
    password      : USER_PASSWORD,
    email_confirm : true,
    user_metadata : { full_name: USER_NAME },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️   User already exists — fetching existing id…');
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === USER_EMAIL);
      if (!existing) { console.error('❌  Could not find existing user.'); process.exit(1); }
      userId = existing.id;
    } else {
      console.error('❌  Auth error:', authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log(`✅  Auth user created → ${userId}`);
  }

  // ── 3. Upsert dashboard_users row ─────────────────────────────────────────
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
  console.log(`✅  dashboard_users profile set`);

  // ── 4. Assign hotel ───────────────────────────────────────────────────────
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

  console.log('─────────────────────────────────────────');
  console.log(`  Hotel     ${HOTEL_NAME}`);
  console.log(`  Email     ${USER_EMAIL}`);
  console.log(`  Password  ${USER_PASSWORD}`);
  console.log(`  Role      ${HOTEL_ROLE}`);
  console.log(`  Login     https://admin.boredtourist.com`);
  console.log('─────────────────────────────────────────\n');
}

run();
