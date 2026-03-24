/**
 * Creates a group-level admin for The Editory Collection Hotels.
 * The user is assigned as 'owner' to all 12 hotels in the group.
 *
 * Usage:
 *   1. Edit the USER_* config below
 *   2. npm run create-editory-admin
 *
 * To add individual hotel staff later, use:
 *   npm run create-hotel-user  (edit HOTEL_ID to the specific hotel)
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USER_EMAIL    = 'admin@editoryhotels.com'; // ← email do admin do grupo
const USER_PASSWORD = 'ChangeMe123!';            // ← password temporária
const USER_NAME     = 'Editory Hotels Admin';    // ← nome completo

// Role for each hotel assignment: 'owner' | 'admin' | 'staff'
const HOTEL_ROLE = 'owner';
// ─────────────────────────────────────────────────────────────────────────────

// All 12 hotels in the Editory group, organised by destination
const EDITORY_HOTELS = [
  // Viana do Castelo
  { id: 'editory-flor-de-sal-viana',        name: 'Flôr de Sal by The Editory',        location: 'Viana do Castelo' },
  // Porto
  { id: 'editory-porto-palacio',            name: 'Porto Palácio Hotel by The Editory', location: 'Porto' },
  { id: 'editory-artist-baixa-porto',       name: 'The Editory Artist Baixa',           location: 'Porto' },
  { id: 'editory-house-ribeira-porto',      name: 'The Editory House Ribeira',          location: 'Porto' },
  { id: 'editory-boulevard-aliados-porto',  name: 'The Editory Boulevard Aliados',      location: 'Porto' },
  { id: 'editory-garden-baixa-porto',       name: 'The Editory Garden Baixa',           location: 'Porto' },
  // Lisboa
  { id: 'editory-riverside-lisboa',         name: 'The Editory Riverside',              location: 'Lisboa' },
  // Lagos
  { id: 'editory-aqualuz-lagos',            name: 'Aqualuz Lagos by The Editory',       location: 'Lagos' },
  { id: 'editory-by-the-sea-lagos',         name: 'The Editory By The Sea Lagos',       location: 'Lagos' },
  { id: 'editory-residence-lagos',          name: 'The Editory Residence Lagos',        location: 'Lagos' },
  // Funchal
  { id: 'editory-ocean-way-funchal',        name: 'The Editory Ocean Way Ajuda',        location: 'Funchal' },
  { id: 'editory-garden-carmo-funchal',     name: 'The Editory Garden Carmo',           location: 'Funchal' },
];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\n🏨  Editory Hotels — Group Admin Setup`);
  console.log(`    User  : ${USER_EMAIL}`);
  console.log(`    Hotels: ${EDITORY_HOTELS.length}\n`);

  // ── 1. Verify all hotels exist ────────────────────────────────────────────
  console.log('⏳  Verifying hotels in hotel_config…');
  const hotelIds = EDITORY_HOTELS.map(h => h.id);

  const { data: existingHotels, error: hotelsError } = await admin
    .from('hotel_config')
    .select('id, name')
    .in('id', hotelIds);

  if (hotelsError) {
    console.error('❌  Could not query hotel_config:', hotelsError.message);
    process.exit(1);
  }

  const foundIds = new Set(existingHotels?.map(h => h.id) ?? []);
  const missing  = EDITORY_HOTELS.filter(h => !foundIds.has(h.id));

  if (missing.length > 0) {
    console.error(`\n❌  ${missing.length} hotel(s) not found in hotel_config:`);
    missing.forEach(h => console.error(`    • ${h.id}  (${h.name})`));
    console.error('\n    → Run supabase-migration-006-editory-hotels.sql first.\n');
    process.exit(1);
  }

  console.log(`✅  All ${EDITORY_HOTELS.length} hotels verified.\n`);

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

  // ── 4. Assign user to all 12 hotels ───────────────────────────────────────
  console.log(`\n⏳  Assigning to ${EDITORY_HOTELS.length} hotels as '${HOTEL_ROLE}'…\n`);

  const assignments = EDITORY_HOTELS.map(h => ({
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
  const byLocation = EDITORY_HOTELS.reduce((acc, h) => {
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
  console.log(`    Role    : hotel_admin (owner of all 12 hotels)`);
  console.log(`\n    ⚠️  Ask the user to change their password on first login.\n`);
}

run().catch(err => { console.error(err); process.exit(1); });
