import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const VIATOR_API_KEY = '0a9b6163-6d27-4f03-bab6-e5debd3d7a8c';
const AFFILIATE_PARAMS = 'pid=P00285354&mcid=42383&medium=link';

const tours = [
  { code: '105349P6',  slug: 'Porto/Off-Track-to-Lagoons-and-Waterfalls-in-Geres-National-Park-from-Porto/d26879-105349P6', city: 'Porto',            lat: 41.1496, lng: -8.6109, category: 'Outdoors'     },
  { code: '14467P1',   slug: 'Braga/Wine-tour-and-wine-tasting-in-a-Vinho-Verde-Estate/d27331-14467P1',                    city: 'Braga',            lat: 41.5454, lng: -8.4265, category: 'Local Cooking' },
  { code: '63975P4',   slug: 'Braga/HORSEBACK-RIDING-TOUR/d27331-63975P4',                                                city: 'Braga',            lat: 41.5454, lng: -8.4265, category: 'Outdoors'     },
  { code: '17822P1',   slug: 'Porto/Geres-Waterfalls-and-Nature-Tour/d26879-17822P1',                                     city: 'Porto',            lat: 41.1496, lng: -8.6109, category: 'Outdoors'     },
  { code: '411314P1',  slug: 'Braga/Tasting-the-best-wines-of-the-region-with-a-Sommelier-in-Braga/d27331-411314P1',      city: 'Braga',            lat: 41.5454, lng: -8.4265, category: 'Local Cooking' },
  { code: '13440P2',   slug: 'Porto/7-lagoons-tour-from-Viana-do-Castelo-train-station/d26879-13440P2',                   city: 'Viana do Castelo', lat: 41.6936, lng: -8.8330, category: 'Outdoors'     },
  { code: '88037P246', slug: 'Braga/Braga-Private-Walking-Tour/d27331-88037P246',                                         city: 'Braga',            lat: 41.5454, lng: -8.4265, category: 'Culture Dive' },
  { code: '15291P1',   slug: 'Braga/Waterfalls-and-Mountains-Tour-of-Peneda-Geres-National-Park/d27331-15291P1',          city: 'Braga',            lat: 41.5454, lng: -8.4265, category: 'Outdoors'     },
];

function formatDuration(itinerary) {
  const dur = itinerary?.duration;
  if (!dur) return '';
  if (dur.fixedDurationInMinutes) {
    const m = dur.fixedDurationInMinutes;
    const h = Math.floor(m / 60), rem = m % 60;
    return rem > 0 ? `${h}h${rem}min` : `${h}h`;
  }
  if (dur.variableDurationFromMinutes) {
    const fmt = m => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? m % 60 + 'min' : ''}` : `${m}min`;
    return `${fmt(dur.variableDurationFromMinutes)} – ${fmt(dur.variableDurationToMinutes)}`;
  }
  return '';
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '• ').replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function getBestImage(image) {
  const p = image.variants.find(v => v.width === 720);
  if (p) return p.url;
  return [...image.variants].sort((a, b) => b.width - a.width)[0]?.url || '';
}

async function viatorGet(path) {
  const res = await fetch(`https://api.viator.com/partner${path}`, {
    headers: { 'exp-api-key': VIATOR_API_KEY, 'Accept-Language': 'en-US', 'Accept': 'application/json;version=2.0' }
  });
  if (!res.ok) throw new Error(`Viator ${res.status}: ${await res.text()}`);
  return res.json();
}

let inserted = 0;
for (const tour of tours) {
  try {
    const [p, pricing] = await Promise.all([
      viatorGet(`/products/${tour.code}?target-lander=NONE`),
      viatorGet(`/availability/schedules/${tour.code}`).catch(() => ({ summary: { fromPrice: 0 }, currency: 'EUR' })),
    ]);

    const desc = stripHtml(p.description || '');
    const coverImage = p.images?.find(i => i.isCover) || p.images?.[0];
    const imageUrl = coverImage ? getBestImage(coverImage) : '';
    const allImages = (p.images || []).map(getBestImage).filter(Boolean);
    const included = (p.inclusions || []).map(i => i.otherDescription || i.typeDescription).filter(Boolean);
    const affiliateUrl = `https://www.viator.com/en-GB/tours/${tour.slug}?${AFFILIATE_PARAMS}`;

    const row = {
      operator_id: 40,
      title: p.title,
      description: desc,
      short_description: desc.length > 200 ? desc.slice(0, 197) + '...' : desc,
      city: tour.city,
      location: tour.city,
      latitude: tour.lat,
      longitude: tour.lng,
      price: pricing.summary?.fromPrice || 0,
      currency: pricing.currency || 'EUR',
      duration: formatDuration(p.itinerary),
      category: tour.category,
      image_url: imageUrl,
      images: allImages,
      included,
      highlights: included,
      what_to_bring: [],
      languages: ['English', 'Portuguese'],
      cancellation_policy: p.cancellationPolicy?.description || 'Free cancellation up to 24 hours in advance',
      important_info: (p.additionalInfo || []).map(a => a.description).join('. '),
      affiliate_url: affiliateUrl,
      verified: true,
      is_active: true,
      instant_booking: true,
      available_today: true,
      display_order: 999,
      tags: ['Viator', tour.city],
    };

    const { error } = await db.from('experiences').insert(row);
    if (error) { console.error('✗ DB', tour.code, error.message); continue; }
    inserted++;
    console.log('✓', tour.code, `[${tour.city}]`, p.title.slice(0, 55));
  } catch (e) {
    console.error('✗', tour.code, e.message);
  }
}

console.log(`\n✅ ${inserted} / ${tours.length} inserted`);
