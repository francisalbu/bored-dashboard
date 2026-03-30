/**
 * Lisbeyond — Group setup
 * - Creates hotel group
 * - Renames existing "lisbeyond" → "Lisbeyond Lisboa"
 * - Creates 4 new units: Porto, Aljezur, Algarve, Silver Coast
 * - Assigns admin@lisbeyond.com to all 5 as owner
 *
 * Usage:
 *   node --env-file=.env scripts/setup-lisbeyond-group.mjs
 */

import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LOGO_URL   = 'https://storage.googleapis.com/bored_tourist_media/images/logolisbeyond.png';
const ADMIN_EMAIL = 'admin@lisbeyond.com';

const THEME = {
  primaryColor    : '#1a1a1a',
  primaryTextColor: '#ffffff',
  accentColor     : '#c8873a',
  backgroundColor : '#FAFAF8',
  surfaceColor    : '#ffffff',
  fontHeading     : 'Inter',
  fontBody        : 'Inter',
};

// 5 units
const HOTELS = [
  {
    id       : 'lisbeyond',          // existing — just update name + group
    name     : 'Lisbeyond Lisboa',
    tagline  : 'The soul of Lisbon, beyond the ordinary',
    location : 'Lisboa',
    latitude : 38.7169,
    longitude: -9.1399,
    subdomain: 'lisbeyond',
    isNew    : false,
  },
  {
    id       : 'lisbeyond-porto',
    name     : 'Lisbeyond Porto',
    tagline  : 'Porto beyond the postcard',
    location : 'Porto',
    latitude : 41.1579,
    longitude: -8.6291,
    subdomain: 'lisbeyond-porto',
    isNew    : true,
  },
  {
    id       : 'lisbeyond-aljezur',
    name     : 'Lisbeyond Aljezur',
    tagline  : 'Wild coast, beyond the ordinary',
    location : 'Aljezur',
    latitude : 37.3183,
    longitude: -8.7971,
    subdomain: 'lisbeyond-aljezur',
    isNew    : true,
  },
  {
    id       : 'lisbeyond-algarve',
    name     : 'Lisbeyond Algarve',
    tagline  : 'Sun, sea and soul in the Algarve',
    location : 'Algarve',
    latitude : 37.0194,
    longitude: -7.9322,
    subdomain: 'lisbeyond-algarve',
    isNew    : true,
  },
  {
    id       : 'lisbeyond-silver-coast',
    name     : 'Lisbeyond Silver Coast',
    tagline  : 'Portugal\'s hidden Atlantic coast',
    location : 'Silver Coast',
    latitude : 39.4039,
    longitude: -9.1358,
    subdomain: 'lisbeyond-silver-coast',
    isNew    : true,
  },
];

async function run() {
  console.log('\n🏨  Lisbeyond Group — Setup\n');

  // ── 1. Create hotel group ─────────────────────────────────────────────────
  const { data: groupData, error: groupError } = await admin
    .from('hotel_groups')
    .upsert({ name: 'Lisbeyond', slug: 'lisbeyond', logo_url: LOGO_URL }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (groupError) { console.error('❌ Group error:', groupError.message); process.exit(1); }
  const groupId = groupData.id;
  console.log(`✅ Group created → ${groupId}`);

  // ── 2. Update existing Lisboa hotel ──────────────────────────────────────
  const { error: updateError } = await admin
    .from('hotel_config')
    .update({ name: 'Lisbeyond Lisboa', group_id: groupId })
    .eq('id', 'lisbeyond');

  if (updateError) { console.error('❌ Update Lisboa error:', updateError.message); process.exit(1); }
  console.log('✅ Updated: lisbeyond → Lisbeyond Lisboa');

  // ── 3. Insert 4 new hotels ────────────────────────────────────────────────
  const newHotels = HOTELS.filter(h => h.isNew).map(h => ({
    id       : h.id,
    name     : h.name,
    tagline  : h.tagline,
    location : h.location,
    latitude : h.latitude,
    longitude: h.longitude,
    subdomain: h.subdomain,
    group_id : groupId,
    logo_url : LOGO_URL,
    concierge_avatar_url: LOGO_URL,
    theme    : THEME,
  }));

  const { error: insertError } = await admin
    .from('hotel_config')
    .upsert(newHotels, { onConflict: 'id' });

  if (insertError) { console.error('❌ Insert hotels error:', insertError.message); process.exit(1); }
  console.log(`✅ Created ${newHotels.length} new hotels`);

  // ── 4. Find admin user ────────────────────────────────────────────────────
  const { data: list } = await admin.auth.admin.listUsers();
  const user = list?.users?.find(u => u.email === ADMIN_EMAIL);
  if (!user) { console.error(`❌ User ${ADMIN_EMAIL} not found`); process.exit(1); }
  console.log(`✅ Admin user found → ${user.id}`);

  // ── 5. Assign all 5 hotels to admin ──────────────────────────────────────
  const assignments = HOTELS.map(h => ({ user_id: user.id, hotel_id: h.id, role: 'owner' }));
  const { error: assignError } = await admin
    .from('dashboard_user_hotels')
    .upsert(assignments, { onConflict: 'user_id,hotel_id' });

  if (assignError) { console.error('❌ Assign error:', assignError.message); process.exit(1); }
  console.log(`✅ Assigned all 5 hotels to ${ADMIN_EMAIL}\n`);

  console.log('─────────────────────────────────────────');
  HOTELS.forEach(h => console.log(`  • ${h.name.padEnd(30)} ${h.subdomain}.boredtourist.com`));
  console.log('─────────────────────────────────────────');
  console.log(`\n  Login  https://admin.boredtourist.com`);
  console.log(`  Email  ${ADMIN_EMAIL}\n`);
}

run().catch(err => { console.error(err); process.exit(1); });
