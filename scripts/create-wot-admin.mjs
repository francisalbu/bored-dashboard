/**
 * Creates a group-level admin for WOT Hotels.
 * The user is assigned as 'owner' to all 5 hotels in the group.
 *
 * Prerequisites:
 *   Run supabase-migration-014-wot-hotels.sql first.
 *
 * Usage:
 *   node scripts/create-wot-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USER_EMAIL    = 'wot@boredtourist.com';
const USER_PASSWORD = 'WotHotels2026!';
const USER_NAME     = 'WOT Hotels Admin';

// Role for each hotel assignment: 'owner' | 'admin' | 'staff'
const HOTEL_ROLE = 'owner';
// ─────────────────────────────────────────────────────────────────────────────

// All 5 hotels in the WOT Hotels group
const WOT_HOTELS = [
  // Costa da Caparica
  { id: 'wot-soul-costa-da-caparica', name: 'WOT Soul Costa da Caparica', location: 'Costa da Caparica' },
  // Lagos
  { id: 'wot-soul-lagos-montemar',    name: 'WOT Soul Lagos Montemar',    location: 'Lagos' },
  // Porto
  { id: 'wot-soul-porto',             name: 'WOT Soul Porto',             location: 'Porto' },
  // Algarve — Vila do Bispo
  { id: 'aldeiadapedralva',           name: 'Aldeia da Pedralva',         location: 'Vila do Bispo' },
  // Alentejo — Monsaraz
  { id: 'hortadamoura',               name: 'Horta da Moura',             location: 'Monsaraz' },
];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\n🏨  WOT Hotels — Group Admin Setup`);
  console.log(`    User  : ${USER_EMAIL}`);
  console.log(`    Hotels: ${WOT_HOTELS.length}\n`);

  // ── 1. Verify all hotels exist ────────────────────────────────────────────
  console.log('⏳  Verifying hotels in hotel_config…');
  const hotelIds = WOT_HOTELS.map(h => h.id);

  const { data: existingHotels, error: hotelsError } = await admin
    .from('hotel_config')
    .select('id, name')
    .in('id', hotelIds);

  if (hotelsError) {
    console.error('❌  Could not query hotel_config:', hotelsError.message);
    process.exit(1);
  }

  const foundIds = new Set(existingHotels?.map(h => h.id) ?? []);
  const missing  = WOT_HOTELS.filter(h => !foundIds.has(h.id));

  if (missing.length > 0) {
    console.error(`\n❌  ${missing.length} hotel(s) not found in hotel_config:`);
    missing.forEach(h => console.error(`    • ${h.id}  (${h.name})`));
    console.error('\n    → Run supabase-migration-014-wot-hotels.sql first.\n');
    process.exit(1);
  }

  console.log(`✅  All ${WOT_HOTELS.length} hotels verified.\n`);

  // ── 2. Create (or find) auth user ─────────────────────────────────────────
  let userId;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: USER_EMAIL,
    password: USER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: USER_NAME },
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
    console.log(`✅  Auth user created  → ${userId}`);
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

  console.log(`✅  Dashboard profile ready`);

  // ── 4. Assign user to all 5 hotels ────────────────────────────────────────
  console.log(`\n⏳  Assigning to ${WOT_HOTELS.length} hotels as '${HOTEL_ROLE}'…\n`);

  const assignments = WOT_HOTELS.map(h => ({
    user_id:  userId,
    hotel_id: h.id,
    role:     HOTEL_ROLE,
  }));

  const { error: assignError } = await admin
    .from('dashboard_user_hotels')
    .upsert(assignments, { onConflict: 'user_id,hotel_id' });

  if (assignError) {
    console.error('❌  Could not assign hotels:', assignError.message);
    process.exit(1);
  }

  // ── 5. Summary ────────────────────────────────────────────────────────────
  const byLocation = WOT_HOTELS.reduce((acc, h) => {
    if (!acc[h.location]) acc[h.location] = [];
    acc[h.location].push(h.name);
    return acc;
  }, {});

  console.log('✅  Hotel assignments complete:\n');
  for (const [location, names] of Object.entries(byLocation)) {
    console.log(`    📍 ${location}`);
    names.forEach(n => console.log(`       • ${n}`));
  }

  console.log(`\n🎉  Done!`);
  console.log(`    Email   : ${USER_EMAIL}`);
  console.log(`    Password: ${USER_PASSWORD}`);
  console.log(`    Role    : hotel_admin (owner of all 5 hotels)`);
  console.log(`\n    ⚠️  Ask the client to change their password on first login.\n`);
}

run().catch(err => { console.error(err); process.exit(1); });
