/**
 * Creates the Wotels group admin user.
 * The user is assigned as 'owner' to all 9 hotels in the Wotels group.
 *
 * Prerequisites:
 *   Run supabase-migration-017-wotels-group.sql first.
 *
 * Usage:
 *   node --env-file=.env scripts/create-wotels-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USER_EMAIL    = 'admin@wotels.com';
const USER_PASSWORD = 'Wotels2026!';
const USER_NAME     = 'Wotels Admin';
const HOTEL_ROLE    = 'owner';
// ─────────────────────────────────────────────────────────────────────────────

const WOTELS_HOTELS = [
  { id: 'wot-porto-soul',               name: 'WOT Porto Soul',               location: 'Porto' },
  { id: 'wot-pateira-soul',             name: 'WOT Pateira Soul',             location: 'Fermentelos' },
  { id: 'wot-ericeira-soul',            name: 'WOT Ericeira Soul',            location: 'Ericeira' },
  { id: 'wot-lodge-soul',               name: 'WOT Lodge Soul',               location: 'Ericeira' },
  { id: 'wot-sarrazola-soul',           name: 'WOT Sarrazola Soul',           location: 'Sintra' },
  { id: 'wot-ocean-soul',               name: 'WOT Ocean Soul',               location: 'Colares' },
  { id: 'wot-costa-da-caparica-soul',   name: 'WOT Costa da Caparica Soul',   location: 'Costa da Caparica' },
  { id: 'wot-lagos-montemar-soul',      name: 'WOT Lagos Montemar Soul',      location: 'Lagos' },
  { id: 'wot-algarve-soul',             name: 'WOT Algarve Soul',             location: 'Loulé' },
];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\n🏨  Wotels — Group Admin Setup`);
  console.log(`    User  : ${USER_EMAIL}`);
  console.log(`    Hotels: ${WOTELS_HOTELS.length}\n`);

  // ── 1. Verify all hotels exist ────────────────────────────────────────────
  console.log('⏳  Verifying hotels in hotel_config…');
  for (const hotel of WOTELS_HOTELS) {
    const { data, error } = await admin
      .from('hotel_config')
      .select('id, name')
      .eq('id', hotel.id)
      .single();

    if (error || !data) {
      console.error(`❌  Hotel not found: ${hotel.id}`);
      console.error('    Run supabase-migration-017-wotels-group.sql first.');
      process.exit(1);
    }
    console.log(`    ✓  ${data.name}`);
  }

  // ── 2. Create or fetch auth user ──────────────────────────────────────────
  console.log(`\n⏳  Creating auth user: ${USER_EMAIL}…`);

  let userId;

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === USER_EMAIL);

  if (existing) {
    console.log(`    ℹ️   User already exists (${existing.id}), resetting password…`);
    await admin.auth.admin.updateUserById(existing.id, { password: USER_PASSWORD });
    userId = existing.id;
  } else {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: USER_EMAIL,
      password: USER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: USER_NAME },
    });

    if (createError) {
      console.error('❌  Failed to create auth user:', createError.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`    ✓  Created auth user: ${userId}`);
  }

  // ── 3. Upsert dashboard_users profile ────────────────────────────────────
  console.log(`\n⏳  Upserting dashboard_users profile…`);
  const { error: profileError } = await admin
    .from('dashboard_users')
    .upsert({
      id:        userId,
      email:     USER_EMAIL,
      full_name: USER_NAME,
      role:      'hotel_admin',
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('❌  Failed to upsert profile:', profileError.message);
    process.exit(1);
  }
  console.log(`    ✓  Profile upserted (role: hotel_admin)`);

  // ── 4. Assign all 9 hotels ────────────────────────────────────────────────
  console.log(`\n⏳  Assigning hotels…`);
  for (const hotel of WOTELS_HOTELS) {
    const { error: linkError } = await admin
      .from('dashboard_user_hotels')
      .upsert({
        user_id:  userId,
        hotel_id: hotel.id,
        role:     HOTEL_ROLE,
      }, { onConflict: 'user_id,hotel_id' });

    if (linkError) {
      console.error(`❌  Failed to link ${hotel.id}:`, linkError.message);
    } else {
      console.log(`    ✓  ${hotel.name} (${hotel.location})`);
    }
  }

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log(`
✅  Wotels admin ready!

    Email    : ${USER_EMAIL}
    Password : ${USER_PASSWORD}
    Role     : hotel_admin
    Hotels   : ${WOTELS_HOTELS.length} properties assigned

    ⚠️  Share credentials securely and ask the user to change password on first login.
`);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
