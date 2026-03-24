import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LOGO = 'https://www.portugalventures.pt/wp-content/uploads/2021/01/Portfolio_Wotels_300x300px.png';
const ALL_WOT = ['wot-soul-costa-da-caparica','wot-soul-lagos-montemar','wot-soul-porto','aldeiadapedralva','hortadamoura'];

async function linkExperiences(hotelId, cityMatchers) {
  const { data: exps, error: fetchErr } = await supabase
    .from('experiences')
    .select('id, display_order, city, location')
    .eq('is_active', true);

  if (fetchErr) { console.error('fetch error', fetchErr); return; }

  const matched = exps.filter(e => {
    const c = (e.city || '').toLowerCase();
    const l = (e.location || '').toLowerCase();
    return cityMatchers.some(m => c.includes(m) || l.includes(m));
  });

  console.log(`  ${hotelId}: ${matched.length} experiences matched`);
  if (!matched.length) return;

  const rows = matched.map(e => ({
    hotel_id: hotelId,
    experience_id: e.id,
    is_active: true,
    display_order: e.display_order,
  }));

  const { error: upsertErr } = await supabase
    .from('hotel_experiences')
    .upsert(rows, { onConflict: 'hotel_id,experience_id' });

  if (upsertErr) console.error('upsert error', hotelId, upsertErr);
  else console.log(`  ✅ ${hotelId} → ${matched.length} experiences linked`);
}

async function run() {
  // 1. Update all logos
  const { error: logoErr } = await supabase
    .from('hotel_config')
    .update({ logo_url: LOGO })
    .in('id', ALL_WOT);
  if (logoErr) console.error('Logo error:', logoErr);
  else console.log('✅ Logo updated for all 5 WOT hotels');

  const { error: groupLogoErr } = await supabase
    .from('hotel_groups')
    .update({ logo_url: LOGO })
    .eq('slug', 'wot-hotels');
  if (groupLogoErr) console.error('Group logo error:', groupLogoErr);
  else console.log('✅ Group logo updated\n');

  // 2. Link experiences
  console.log('Linking experiences...');
  await linkExperiences('wot-soul-porto', ['porto']);
  await linkExperiences('wot-soul-lagos-montemar', ['lagos']);
  // Aldeia da Pedralva is near Lagos / Costa Vicentina — same area experiences
  await linkExperiences('aldeiadapedralva', ['lagos', 'vila do bispo', 'sagres', 'algarve']);
}

run().catch(console.error);
